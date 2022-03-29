import React, { useEffect, useState } from 'react';
import { Layer, Stage } from 'react-konva';
import CssBaseline from '@mui/material/CssBaseline';
import Konva from 'konva';
import { BgsIgnitor, BgsIgnitorCtx } from '../../libs/bgs/ecs';
import { Ignitor } from '../../libs/ecs/ignitor';
import { World } from '../../libs/ecs/world';
import { EntityId } from '../../libs/ecs/entity';
import { ChangeReactPositionSystem } from '../../libs/bgs/ecs/systems/change-react-position-system';
import { ChangeReactImageSystem } from '../../libs/bgs/ecs/systems/change-react-image-system';
import { SpawnGameMapSystem } from '../../libs/bgs/ecs/systems/spawn-game-map-system';
import { ChangeReactSizeSystem } from '../../libs/bgs/ecs/systems/change-react-size';
import { ECSCustomImage } from '../../modules/widgets/CustomImage/ui/ecs';
import { SpawnHeroSystem } from '../../libs/bgs/ecs/systems/spawn-hero-system';
import { MouseInputSystem } from '../../libs/bgs/ecs/systems/mouse-input';
import { PlayerSystem } from '../../libs/bgs/ecs/systems/player';
import { DragSystem } from '../../libs/bgs/ecs/systems/drag';
import { SelectSystem } from '../../libs/bgs/ecs/systems/select';
import { useForceUpdate } from '../../libs/react/hooks/use-force-update';
import { HeroSets } from '../../libs/bgs/games/unmatched';
import { SpawnHeroSetSystem } from '../../libs/bgs/ecs/systems/spawn-hero-set-system';
import { SpawnGameObjectSystem } from '../../libs/bgs/ecs/systems/spawn-game-object';
import { SpawnSidekickEventSystem } from '../../libs/bgs/ecs/systems/spawn-sidekick-system';
import { SpawnDeckEventSystem } from '../../libs/bgs/ecs/systems/spawn-deck-system';
import { SpawnCardEventSystem } from '../../libs/bgs/ecs/systems/spawn-card-system';
import { SpawnHealthMeterEventSystem } from '../../libs/bgs/ecs/systems/spawn-health-meter-system';
import { SpawnRuleCardEventSystem } from '../../libs/bgs/ecs/systems/spawn-rule-card-system';
import { MainMenu } from '../../modules/widgets/MainMenu';
import { ContextMenu } from '../../modules/widgets/ContextMenu';

const ignitor: BgsIgnitor = {
  world: {
    pools: {},
  },
  ctx: {} as BgsIgnitorCtx,
  systems: [
    // INIT
    PlayerSystem(),

    // INPUT
    MouseInputSystem(),

    // INTERACTION
    SelectSystem(),
    DragSystem(),

    // SPAWN
    SpawnGameMapSystem(),
    SpawnHeroSetSystem(),
    SpawnHeroSystem(),
    SpawnSidekickEventSystem(),
    SpawnDeckEventSystem(),
    SpawnCardEventSystem(),
    SpawnRuleCardEventSystem(),
    SpawnHealthMeterEventSystem(),

    // SPAWN GAME OBJECT
    SpawnGameObjectSystem(),

    // SPAWN REACT GAME OBJECT
    // ...

    // RENDER REACT
    ChangeReactPositionSystem(),
    ChangeReactImageSystem(),
    ChangeReactSizeSystem(),
  ],
};

// @ts-ignore
window.ignitor = ignitor;
// @ts-ignore
window.Ignitor = Ignitor;
// @ts-ignore
window.World = World;

const initIgnitor = async () => {
  await Ignitor.init(ignitor);

  let lastTimeStamp = new Date();
  const run = async () => {
    const newTimeStamp = new Date();
    await Ignitor.run(ignitor, newTimeStamp.getMilliseconds() - lastTimeStamp.getMilliseconds());
    lastTimeStamp = newTimeStamp;
    requestAnimationFrame(run);
  };

  requestAnimationFrame(run);
};

function App() {
  const surfaceWidth = window.innerWidth;
  const surfaceHeight = window.innerHeight;

  const forceUpdate = useForceUpdate();
  const [heroSets] = useState(HeroSets);
  const [, selectShape] = useState<string | null>(null);

  const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  useEffect(() => {
    Ignitor.addToCtx(ignitor, 'heroSets', heroSets);
  }, [heroSets]);

  useEffect(() => {
    initIgnitor();
    setInterval(() => {
      forceUpdate();
    }, 1000);
  }, []);

  console.log('RERENDER');

  const gameObjectComponentPool = World.getOrAddPool(ignitor.world, 'GameObjectComponent');

  return (
    <div>
      <CssBaseline />
      <ContextMenu ignitor={ignitor}>
        <Stage
          style={{ backgroundColor: '#e1e1e1' }}
          width={surfaceWidth}
          height={surfaceHeight}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
        >
          <Layer>
            {Object.keys(gameObjectComponentPool.data).map((entity) => {
              return <ECSCustomImage key={entity} entity={entity as EntityId} ignitor={ignitor} />;
            })}
          </Layer>
        </Stage>
      </ContextMenu>
      <MainMenu ignitor={ignitor} heroSets={heroSets} />
    </div>
  );
}

export default App;
