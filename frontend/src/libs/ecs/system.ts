import { World } from './world';
import { Component } from './component';

export type System<CR extends Record<string, Component<any, any>> = Record<string, Component<any, any>>> = {
  preInit?: (world: World<CR>) => Promise<void>;
  init?: (world: World<CR>) => Promise<void>;
  run: (world: World<CR>) => Promise<void>;
  destroy?: (world: World<CR>) => Promise<void>;
  postDestroy?: (world: World<CR>) => Promise<void>;
};
