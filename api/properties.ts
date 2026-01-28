import { supabase } from '../lib/supabaseClient';
import { Property, Room } from '../types';

const mapRowToProperty = (row: any, rooms: Room[] = []): Property => ({
    id: row.id,
    name: row.name,
    address: row.address,
    rooms: rooms
});

const mapRowToRoom = (row: any): Room => ({
    id: row.id,
    number: row.number
});

export async function getProperties(): Promise<Property[]> {
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
        return [];
    }

    const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .eq('user_id', user.id);

    if (roomsError) {
        console.error('Error fetching rooms:', roomsError);
        return [];
    }

    const roomsByProperty = (roomsData || []).reduce((acc: Record<string, Room[]>, row) => {
        const propertyId = row.property_id;
        if (!acc[propertyId]) acc[propertyId] = [];
        acc[propertyId].push(mapRowToRoom(row));
        return acc;
    }, {});

    return (propertiesData || []).map(row =>
        mapRowToProperty(row, roomsByProperty[row.id] || [])
    );
}

export async function createProperty(property: Partial<Property>): Promise<Property | null> {
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('properties')
        .insert([{
            name: property.name || 'New Property',
            address: property.address || 'No address',
            user_id: user.id
        }])
        .select()
        .maybeSingle();

    if (error) {
        console.error('Error creating property:', error);
        return null;
    }

    return data ? mapRowToProperty(data, []) : null;
}

export async function updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('properties')
        .update({ name: updates.name, address: updates.address })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .maybeSingle();

    if (error) {
        console.error('Error updating property:', error);
        return null;
    }

    return data ? mapRowToProperty(data, updates.rooms || []) : null;
}

export async function deleteProperty(id: string): Promise<boolean> {
    if (!supabase) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting property:', error);
        return false;
    }

    return true;
}

export async function addRoom(propertyId: string, roomNumber: string): Promise<Room | null> {
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('rooms')
        .insert([{ property_id: propertyId, number: roomNumber, user_id: user.id }])
        .select()
        .maybeSingle();

    if (error) {
        console.error('Error adding room:', error);
        return null;
    }

    return data ? mapRowToRoom(data) : null;
}

export async function updateRoom(roomId: string, roomNumber: string): Promise<Room | null> {
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('rooms')
        .update({ number: roomNumber })
        .eq('id', roomId)
        .eq('user_id', user.id)
        .select()
        .maybeSingle();

    if (error) {
        console.error('Error updating room:', error);
        return null;
    }

    return data ? mapRowToRoom(data) : null;
}

export async function deleteRoom(roomId: string): Promise<boolean> {
    if (!supabase) return false;

    const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

    if (error) {
        console.error('Error deleting room:', error);
        return false;
    }

    return true;
}
