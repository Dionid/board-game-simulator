import { CSSProperties, useEffect } from "react";
import { initPongGame } from "./game";
import { run } from "libs/tengine/game";
import { useAtom } from "jotai";
import { scores } from "./state";

const containerStyle: CSSProperties = {
  padding: 15,
  color: "#fff",
  top: 0,
  left: 0,
  position: "absolute",
  width: "100vw",
  height: "100vh",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  opacity: 0.07,
  fontSize: "120px",
  fontFamily: "monospace",
}

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
        <div style={containerStyle}>
            <div style={{width: "50%"}}>{ score.player }</div>
            <div style={{width: "50%"}}>{ score.enemy }</div>
        </div>
        <div id="gameHolder"></div>
      </div>
    )
}