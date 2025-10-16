'use client
import { useEffect, useState } from 'react'
import api from '@/app/lib/axios'
import { useCart } from '@/cart/cart'

export default function RoomDetail({ id }: { id: string }) {
    const [room, setRoom] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const addItem = useCart(s => s.addRoom)

    useEffect(() => {
        setLoading(true)
        api.get(`/rooms/${id}`)
        .then(r => setRoom(r.data))
        .catch(e => console.log(e))
        .finally(() => setLoading(false))
    }, [id])

    if (loading) return <div>Cargando...</div>
    if (!room) return <div>Habitaciòn no encontrada</div>

    return (
        <div>
            <h1>Room Detail</h1>
        </div>
    )
}