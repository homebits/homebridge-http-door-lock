import type { PlatformAccessory, Service, CharacteristicValue } from 'homebridge';

import type { HttpDoorLockPlatform } from './platform.js';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory the platform registers.
 */

export class HttpDoorLockPlatformAccessory
{
    constructor(private readonly platform: HttpDoorLockPlatform, private readonly accessory: PlatformAccessory)
    {
        // set accessory information
        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Manufacturer, accessory.context.device.manufacturer || 'Device-Manufacturer')
            .setCharacteristic(this.platform.Characteristic.Model, accessory.context.device.model || 'Default-Model')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.serial || 'Default-Serial');

        const lockService = this.accessory.getService('Lock Mechanism') || this.accessory.addService(this.platform.Service.LockMechanism, 'Lock Mechanism', 'Lock-Mechanism');

        lockService.setCharacteristic(this.platform.Characteristic.LockCurrentState, this.platform.Characteristic.LockCurrentState.SECURED);
        lockService.setCharacteristic(this.platform.Characteristic.LockTargetState, this.platform.Characteristic.LockTargetState.SECURED);

        lockService
            .getCharacteristic(this.platform.Characteristic.LockTargetState)
            .onSet(async (value: CharacteristicValue) =>
            {
                await this.HandleLockRequest(accessory.context.device, lockService, value as number);
            });
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    private async HandleLockRequest(device: any, lockService: Service, targetState: number)
    {
        const name = device.name || 'HTTP Lock';
        const timeout = 10;

        if (targetState === this.platform.Characteristic.LockTargetState.SECURED)
        {
            const response = await fetch(device.closeEndpoint.url, { method: device.closeEndpoint.method || 'GET', headers: device.closeEndpoint.headers || {}, signal: AbortSignal.timeout(timeout * 1000) }).catch(() => null);
            const success = response?.ok ?? false;

            if (success)
            {
                lockService.updateCharacteristic(this.platform.Characteristic.LockCurrentState, this.platform.Characteristic.LockCurrentState.SECURED);
                this.platform.log.info(`${name} is locked.`);
            }
            else
            {
                setTimeout(() =>
                {
                    lockService.updateCharacteristic(this.platform.Characteristic.LockCurrentState, this.platform.Characteristic.LockCurrentState.UNSECURED);
                    lockService.updateCharacteristic(this.platform.Characteristic.LockTargetState, this.platform.Characteristic.LockTargetState.UNSECURED);
                    this.platform.log.error(`Failed to lock ${name}.`);
                }, 1000);
            }

            return;
        }
        else if (targetState === this.platform.Characteristic.LockTargetState.UNSECURED)
        {
            const response = await fetch(device.openEndpoint.url, { method: device.openEndpoint.method || 'GET', headers: device.openEndpoint.headers || {}, signal: AbortSignal.timeout(timeout * 1000) }).catch(() => null);
            const success = response?.ok ?? false;

            if (success)
            {
                lockService.updateCharacteristic(this.platform.Characteristic.LockCurrentState, this.platform.Characteristic.LockCurrentState.UNSECURED);
                this.platform.log.info(`${name} is unlocked.`);

                if (device.autoLock?.enabled)
                {
                    const delay = device.autoLock.delay ?? 5;

                    setTimeout(() =>
                    {
                        lockService.setCharacteristic(this.platform.Characteristic.LockTargetState, this.platform.Characteristic.LockTargetState.SECURED);
                        this.platform.log.info(`${name} is auto locked.`);
                    }, delay * 1000);

                    return;
                }
                else if (device.resetLock?.enabled)
                {
                    const delay = device.resetLock.delay ?? 5;

                    setTimeout(() =>
                    {
                        lockService.updateCharacteristic(this.platform.Characteristic.LockCurrentState, this.platform.Characteristic.LockCurrentState.SECURED);
                        lockService.updateCharacteristic(this.platform.Characteristic.LockTargetState, this.platform.Characteristic.LockTargetState.SECURED);
                        this.platform.log.info(`${name} reset to locked.`);
                    }, delay * 1000);
                }
            }
            else
            {
                setTimeout(() =>
                {
                    lockService.updateCharacteristic(this.platform.Characteristic.LockCurrentState, this.platform.Characteristic.LockCurrentState.SECURED);
                    lockService.updateCharacteristic(this.platform.Characteristic.LockTargetState, this.platform.Characteristic.LockTargetState.SECURED);
                    this.platform.log.error(`Failed to unlock ${name}.`);
                }, 1000);
            }
        }

        return;
    }
}