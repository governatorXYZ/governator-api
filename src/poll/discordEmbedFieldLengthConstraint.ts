import { 
    ValidatorConstraint, 
    ValidatorConstraintInterface, 
    ValidationArguments, 
    ValidationOptions,
    registerDecorator
} from 'class-validator';
import { ClientConfigDiscordDto } from './poll.dtos'


@ValidatorConstraint()
export class DiscordEmbedFieldLengthConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName, lte] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName] as Array<any>;
    const discordClientConfig = relatedValue.find((conf) => conf.provider_id === 'discord') as ClientConfigDiscordDto
    return Array.isArray(value) && typeof Array.isArray(relatedValue) && (value.length + discordClientConfig.role_restrictions.length) <= lte;
  }

  defaultMessage(args: ValidationArguments) {
    const [, lte] = args.constraints;
    return `Sum of poll_options.lenth and role_restrictions.lenth must be less than ${lte + 1}`;
  }
}

export function DiscordEmbedFieldLength(property: string, lte: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'discordEmbedFieldLength',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property, lte],
      options: validationOptions,
      validator: DiscordEmbedFieldLengthConstraint,
    });
  }
}