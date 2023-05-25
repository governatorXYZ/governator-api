import { Injectable } from '@nestjs/common';
import { registerDecorator, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ethers } from 'ethers';

@Injectable()
@ValidatorConstraint()
export class IsEthAddressConstraint implements ValidatorConstraintInterface {
    constructor() {
        // do nothing
    }

    defaultMessage(): string {
        return 'Invalid ethereum address';
    }

    validate(value: any): Promise<boolean> | boolean {

        try {
            ethers.getAddress(value);

            return true;

        } catch {
            return false;

        }
    }
}

export function IsEthAddress() {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function(object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            validator: IsEthAddressConstraint,
        });
    };
}