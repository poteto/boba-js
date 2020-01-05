import {
  InternalObject,
  HashableInternalObject,
} from '../eval/internal-objects';

export default function isHashableInternalObject(
  obj: InternalObject
): obj is HashableInternalObject {
  return typeof obj['toHashKey'] === 'function';
}
