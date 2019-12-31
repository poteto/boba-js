import { InternalObject, InternalObjectType, Environment } from './';
import { BlockStatement, Identifier } from '../../ast';

export default class InternalFunction implements InternalObject {
  constructor(
    public env: Environment,
    public body: BlockStatement,
    public parameters: Identifier[]
  ) {}

  get type() {
    return InternalObjectType.FUNCTION_OBJ;
  }

  inspect() {
    const parameters = this.parameters?.map(p => p.toString()).join(', ');
    let block = this.body?.toString();
    if (block?.length) {
      block = `{ ${this.body?.toString()} }`;
    } else {
      block = '{}';
    }
    return `fn(${parameters}) ${block}`;
  }
}
