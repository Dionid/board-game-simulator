import { World } from './world';
import { Component } from './component';

export type System<CR extends Record<string, Component<any, any>> = Record<string, Component<any, any>>> = {
  preInit?: (world: World<CR>) => Promise<World<CR>>;
  init?: (world: World<CR>) => Promise<World<CR>>;
  run: (world: World<CR>) => Promise<World<CR>>;
  destroy?: (world: World<CR>) => Promise<World<CR>>;
  postDestroy?: (world: World<CR>) => Promise<World<CR>>;
};
