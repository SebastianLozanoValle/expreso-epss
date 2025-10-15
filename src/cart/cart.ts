import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartRoom = {
  id: string
  name: string
  price: number
  uniqueId: string // ID único para cada instancia
}

type CartState = {
    rooms: CartRoom[]
    addRoom: (room: Omit<CartRoom, 'uniqueId'>) => void
    removeRoom: (uniqueId: string) => void
    clearCart: () => void
    subTotal: () => number
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
        rooms: [],
        addRoom: (room) => {
            set((state) => ({
                rooms: [...state.rooms, { 
                    ...room, 
                    uniqueId: `${room.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                }]
            }))
        },
        removeRoom: (uniqueId) => {
            set((state) => ({ 
                rooms: state.rooms.filter((r) => r.uniqueId !== uniqueId) 
            }))
        },
        clearCart: () => {
            set({ rooms: [] })
        },
        subTotal: () => get().rooms.reduce((s, room) => s + room.price, 0),
    }), {
        name: 'cart',
    })
)
