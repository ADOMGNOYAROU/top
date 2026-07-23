import { SetMetadata } from '@nestjs/common';
import { SKIP_DELEGATION_CHECK } from '../guards/delegation.guard';

// Exempte un endpoint du blocage de délégation (ex: révoquer la délégation elle-même)
export const SkipDelegationCheck = () => SetMetadata(SKIP_DELEGATION_CHECK, true);
