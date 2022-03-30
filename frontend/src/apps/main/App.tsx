import React, { useEffect, useMemo, useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { BgsIgnitor, BgsIgnitorCtx } from '../../libs/bgs/ecs';
import { Ignitor } from '../../libs/ecs/ignitor';
import { World } from '../../libs/ecs/world';
import { ChangeReactPositionSystem } from '../../libs/bgs/ecs/systems/change-react-position-system';
import { ChangeReactImageSystem } from '../../libs/bgs/ecs/systems/change-react-image-system';
import { SpawnGameMapSystem } from '../../libs/bgs/ecs/systems/spawn-game-map-system';
import { ChangeReactSizeSystem } from '../../libs/bgs/ecs/systems/change-react-size';
import { SpawnHeroSystem } from '../../libs/bgs/ecs/systems/spawn-hero-system';
import { HandInputSystem } from '../../libs/bgs/ecs/systems/mouse-input';
import { PlayerSystem } from '../../libs/bgs/ecs/systems/player';
import { DragSystem } from '../../libs/bgs/ecs/systems/drag';
import { SelectSystem } from '../../libs/bgs/ecs/systems/select';
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
import { CameraSystem } from '../../libs/bgs/ecs/systems/camera';
import { BoardSystem } from '../../libs/bgs/ecs/systems/board';
import { useForceUpdate } from '../../libs/react/hooks/use-force-update';
import { Minimap } from '../../modules/widgets/Minimap';
import { GameStage } from '../../modules/widgets/GameStage';

// TODO. Move
const boardSize = {
  width: 5000,
  height: 3000,
};
function App() {
  const [forceUpdateState, forceUpdate] = useForceUpdate();
  const [heroSets] = useState(HeroSets);

  const ignitor = useMemo(() => {
    const ignitor: BgsIgnitor = {
      world: {
        pools: {},
      },
      ctx: {
        forceUpdate,
      } as BgsIgnitorCtx,
      systems: [
        // INIT
        PlayerSystem(),

        // INPUT
        HandInputSystem(),

        // CAMERA
        BoardSystem(boardSize),
        CameraSystem(),

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

    (async () => {
      await Ignitor.init(ignitor);
      forceUpdate();

      let lastTimeStamp = new Date();
      const run = async () => {
        const newTimeStamp = new Date();
        const timeDelta = newTimeStamp.getMilliseconds() - lastTimeStamp.getMilliseconds();
        await Ignitor.run(ignitor, timeDelta < 0 ? 0 : timeDelta);
        lastTimeStamp = newTimeStamp;
        requestAnimationFrame(run);
      };

      requestAnimationFrame(run);
    })();

    return ignitor;
  }, []);

  useEffect(() => {
    Ignitor.addToCtx(ignitor, 'heroSets', heroSets);
  }, [heroSets]);

  // TODO. Refactor for collaboration
  const playerEntities = World.filter(ignitor.world, ['PlayerComponent', 'CameraComponent']);
  const playerEntity = playerEntities[0];

  console.log('APP', playerEntity);

  return (
    <div>
      <CssBaseline />
      <ContextMenu ignitor={ignitor}>
        {playerEntity && (
          <GameStage forceUpdateState={forceUpdateState} ignitor={ignitor} playerEntity={playerEntity} />
        )}
      </ContextMenu>
      <MainMenu ignitor={ignitor} heroSets={heroSets} />
      {playerEntity && <Minimap ignitor={ignitor} boardSize={boardSize} playerEntity={playerEntity} />}
    </div>
  );
}

export default App;
