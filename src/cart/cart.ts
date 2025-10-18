import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartRoom = {
  id: string
  name: string
  price: number
  basePrice: number // Precio base por 2 huéspedes
  capacity: number // Capacidad máxima de la habitación
  uniqueId: string // ID único para cada instancia
  guestConfig?: {
    adults: number
    children: number
    babies: number
  } // Configuración de huéspedes del GuestSelector
}

type GuestConfig = {
  adults: number
  children: number
  babies: number
}

type CartState = {
    rooms: CartRoom[]
    guestConfigs: GuestConfig[] // Configuraciones del GuestSelector
    preConfiguredRooms: GuestConfig[] // Habitaciones pre-configuradas en GuestSelector
    addRoom: (room: Omit<CartRoom, 'uniqueId'>) => void
    removeRoom: (uniqueId: string) => void
    clearCart: () => void
    subTotal: () => number
    setGuestConfigs: (configs: GuestConfig[]) => void
    setPreConfiguredRooms: (configs: GuestConfig[]) => void // Establecer habitaciones pre-configuradas
    addRoomWithConfig: (room: Omit<CartRoom, 'uniqueId'>, configIndex: number) => void
    addRoomAutoLink: (room: Omit<CartRoom, 'uniqueId'>) => void // Agregar con vinculación automática
    getLinkedRoomsCount: () => number // Obtener cantidad de habitaciones vinculadas
    getPreConfiguredRoomsCount: () => number // Obtener cantidad de habitaciones pre-configuradas
    removeRoomAndUpdateGuestSelector: (uniqueId: string) => void // Eliminar habitación y actualizar GuestSelector
    updateRoomPrice: (uniqueId: string, guestConfig: GuestConfig) => void // Actualizar precio según huéspedes
    calculatePriceForGuests: (basePrice: number, adults: number, children: number) => number // Calcular precio
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
        rooms: [],
        guestConfigs: [],
        preConfiguredRooms: [],
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
            set({ rooms: [], guestConfigs: [], preConfiguredRooms: [] })
        },
        subTotal: () => get().rooms.reduce((s, room) => s + room.price, 0),
        setGuestConfigs: (configs) => {
            set({ guestConfigs: configs })
        },
        setPreConfiguredRooms: (configs) => {
            set({ preConfiguredRooms: configs })
        },
        addRoomWithConfig: (room, configIndex) => {
            const state = get()
            const config = state.guestConfigs[configIndex]
            if (config) {
                set((state) => ({
                    rooms: [...state.rooms, { 
                        ...room, 
                        uniqueId: `${room.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        guestConfig: config
                    }]
                }))
            } else {
                // Si no hay configuración, agregar sin configuración
                set((state) => ({
                    rooms: [...state.rooms, { 
                        ...room, 
                        uniqueId: `${room.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                    }]
                }))
            }
        },
        addRoomAutoLink: (room) => {
            const state = get()
            // Contar habitaciones que ya tienen configuración vinculada
            const linkedRooms = state.rooms.filter(r => r.guestConfig)
            const nextConfigIndex = linkedRooms.length
            
            // Usar habitaciones pre-configuradas del GuestSelector
            let config;
            if (nextConfigIndex < state.preConfiguredRooms.length) {
                // Usar configuración pre-configurada del GuestSelector
                config = state.preConfiguredRooms[nextConfigIndex]
            } else {
                // Si no hay más pre-configuradas, crear configuración por defecto
                config = { adults: 2, children: 0, babies: 0 }
            }
            
            // Calcular precio inicial basado en la configuración
            const initialPrice = get().calculatePriceForGuests(
                room.basePrice || room.price,
                config.adults,
                config.children
            )
            
            set((state) => ({
                rooms: [...state.rooms, { 
                    ...room, 
                    basePrice: room.basePrice || room.price,
                    capacity: room.capacity || 4, // Capacidad por defecto
                    uniqueId: `${room.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    price: initialPrice,
                    guestConfig: config
                }]
            }))
        },
        getLinkedRoomsCount: () => {
            const state = get()
            // Contar todas las habitaciones del carrito
            return state.rooms.length
        },
        getPreConfiguredRoomsCount: () => {
            const state = get()
            // Contar habitaciones pre-configuradas
            return state.preConfiguredRooms.length
        },
        calculatePriceForGuests: (basePrice, adults, children) => {
            // Precio base es para 2 huéspedes
            // Cada huésped adicional (adultos + niños) aumenta el precio en 20%
            const totalGuests = adults + children
            const baseGuests = 2
            const additionalGuests = Math.max(0, totalGuests - baseGuests)
            const priceMultiplier = 1 + (additionalGuests * 0.2) // 20% por huésped adicional
            
            return Math.round(basePrice * priceMultiplier)
        },
        updateRoomPrice: (uniqueId, guestConfig) => {
            set((state) => ({
                rooms: state.rooms.map(room => {
                    if (room.uniqueId === uniqueId) {
                        const newPrice = get().calculatePriceForGuests(
                            room.basePrice,
                            guestConfig.adults,
                            guestConfig.children
                        )
                        return {
                            ...room,
                            price: newPrice,
                            guestConfig: guestConfig
                        }
                    }
                    return room
                })
            }))
        },
        removeRoomAndUpdateGuestSelector: (uniqueId) => {
            const state = get()
            const roomToRemove = state.rooms.find(r => r.uniqueId === uniqueId)
            
            if (roomToRemove && roomToRemove.guestConfig) {
                // Si la habitación tiene configuración, eliminar y ajustar configuraciones
                set((state) => {
                    const newRooms = state.rooms.filter(r => r.uniqueId !== uniqueId)
                    const linkedRooms = newRooms.filter(r => r.guestConfig)
                    
                    // Actualizar las configuraciones del GuestSelector para que coincidan con las habitaciones restantes
                    const updatedGuestConfigs = linkedRooms.map(room => room.guestConfig!);
                    const updatedPreConfiguredRooms = updatedGuestConfigs;
                    
                    // Ajustar las configuraciones para que sean consecutivas
                    const updatedRooms = newRooms.map((room, index) => {
                        if (room.guestConfig) {
                            return {
                                ...room,
                                guestConfig: updatedGuestConfigs[index] || room.guestConfig
                            }
                        }
                        return room
                    })
                    
                    return { 
                        rooms: updatedRooms,
                        guestConfigs: updatedGuestConfigs,
                        preConfiguredRooms: updatedPreConfiguredRooms
                    }
                })
            } else {
                // Si no tiene configuración, solo eliminar
                set((state) => ({ 
                    rooms: state.rooms.filter((r) => r.uniqueId !== uniqueId) 
                }))
            }
        },
    }), {
        name: 'cart',
    })
)
