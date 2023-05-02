import { World } from './world';

export const $systemId = Symbol('ecs_system_id');

export type SystemProps<Ctx extends Record<any, any> | unknown = unknown> = Omit<World<Ctx>, 'systems'>;

export type System<Ctx extends Record<any, any> | unknown = unknown> = ((props: SystemProps<Ctx>) => void) & {
  destroy?: (props: SystemProps<Ctx>) => void;
  [$systemId]?: number;
};
