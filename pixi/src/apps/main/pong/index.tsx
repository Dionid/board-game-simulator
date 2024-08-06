import { CSSProperties, FunctionComponent, useEffect, useState } from "react";
import { initPongGame } from "./game";
import { destroyGame, run } from "libs/tengine/game";
import { useAtom } from "jotai";
import { scores, uiState } from "./state";

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
  opacity: 0.3,
  fontSize: "120px",
  fontFamily: "monospace",
}

export const PongGame: FunctionComponent<{ winScore: number, goBackToMenu: (playerWon: boolean) => void }> = ({ winScore, goBackToMenu }) => {
    useEffect(() => {
        const gameHolder = document.getElementById('gameHolder') as HTMLCanvasElement;

        // # Pong
        initPongGame(gameHolder).then((game) => {
            const stopGame = run(game)
            console.log("PongApp mounted")

            uiState.sub(scores, async () => {
              const state = uiState.get(scores)
              if (state.player >= winScore || state.enemy >= winScore) {
                stopGame();
                game.app.ticker.addOnce(() => {
                  destroyGame(game)
                  uiState.set(scores, { player: 0, enemy: 0 })
                  goBackToMenu(state.player >= winScore)
                })
              }
            })
        })

        return () => {
          console.log("PongApp destroyed")
        }
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

const pongAppContainerStyle: CSSProperties = {
  padding: 15,
  color: "#fff",
  width: "100vw",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "50px",
  fontFamily: "monospace",
  backgroundColor: "#000",
}

const buttonStyle: CSSProperties = {
  border: "1px #eee solid",
  padding: "15px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "30px",
  maxWidth: "200px",
  width: "100%"
}

const menuContainer: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  alignItems: "center",
  cursor: "pointer",
}

export const PongGameMenu: FunctionComponent<{ startGame: () => void}> = ({ startGame }) => {
  return (
    <div style={menuContainer}>
    <h1>SUPER PONG</h1>
    <div style={buttonStyle} onClick={startGame}>PLAY</div>
  </div>
  )
}

export const PongEndGameScreen: FunctionComponent<{ isPlayerWon: boolean, startGame: () => void}> = ({ isPlayerWon, startGame }) => {
  return (
    <div style={menuContainer}>
    <h1>
      { isPlayerWon ? "YOU WON" : "YOU LOSE" }
    </h1>
    <div style={buttonStyle} onClick={startGame}>PLAY AGAIN</div>
  </div>
  )
}

export const PongApp = () => {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [gamePlayed, setGamePlayed] = useState(false)
  const [playerWon, setPlayerWon] = useState(false)

  return (
    <div style={pongAppContainerStyle}>
      {
        isGameStarted && <PongGame winScore={5} goBackToMenu={(playerWon) => {
          setIsGameStarted(false)
          setGamePlayed(true)
          setPlayerWon(playerWon)
        }}/>
      }
      {
        !isGameStarted && !gamePlayed && <PongGameMenu startGame={ () => setIsGameStarted(true) }/>
      }
      {
        !isGameStarted && gamePlayed && <PongEndGameScreen isPlayerWon={playerWon} startGame={() => {
          setIsGameStarted(true)
        } }/>
      }
    </div>
  )
}