import { FunctionComponent, useEffect } from "react";
import { run } from "libs/tengine/game";
import { initSuperMarioLikeGame } from "./game";

export const SuperMarioLikeApp: FunctionComponent = () => {
    useEffect(() => {
        const gameHolder = document.getElementById('gameHolder') as HTMLCanvasElement;

        // # Pong
        initSuperMarioLikeGame(gameHolder).then((game) => {
            run(game)
            console.log("SuperMarioLikeApp mounted")
        })

        return () => {
          console.log("SuperMarioLikeApp destroyed")
        }
    }, [])

    return (
      <div>
        <div id="gameHolder"></div>
      </div>
    )
}
