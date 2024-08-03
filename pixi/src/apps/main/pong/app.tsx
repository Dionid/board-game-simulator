import { useEffect } from "react";
import { initPongGame } from ".";
import { run } from "libs/tengine/game";
import { useAtom } from "jotai";
import { scores } from "./state";


export const PongApp = () => {
    useEffect(() => {
        const gameHolder = document.getElementById('gameHolder') as HTMLCanvasElement;

        // # Pong
        initPongGame(gameHolder).then((game) => {
            run(game)
            console.log("PongApp mounted")
        })
    }, [])

    const [score] = useAtom(scores)

    return (
      <div>
        <div id="gameHolder"></div>
        <div style={{ padding: 15, color: "#fff", top: 0, left: 0, position: "absolute", width: "100vw", height: "100vh", display: "flex", justifyContent: "space-between" }}>
            <div>Player: { score.player }</div>
            <div>Enemy: { score.enemy }</div>
        </div>
      </div>
    )
}