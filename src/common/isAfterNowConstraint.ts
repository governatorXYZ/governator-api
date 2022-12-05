import { 
    ValidatorConstraint, 
    ValidatorConstraintInterface, 
    ValidationArguments, 
    ValidationOptions,
    registerDecorator
} from 'class-validator';


@ValidatorConstraint()
export class IsAfterNowConstraint implements ValidatorConstraintInterface {
  validate(date: Date) {
    return Date.now() < date.getTime();
  }

  defaultMessage(args: ValidationArguments) {
    return `Poll end date cannot be in the past: ${args.value}`;
  }
}

export function IsAfterNow(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsAfterNow',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsAfterNowConstraint,
    });
  };
}