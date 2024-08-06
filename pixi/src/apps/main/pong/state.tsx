import { atom, getDefaultStore } from "jotai";



export const scores = atom({
    player: 0,
    enemy: 0,
})

export const uiState = getDefaultStore()