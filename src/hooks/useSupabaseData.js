import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// snake_case DB → camelCase JS
function dbToPlace(row) {
  return {
    id: row.id,
    city: row.city,
    name: row.name,
    category: row.category,
    description: row.description || '',
    website: row.website || '',
    googleMaps: row.google_maps || '',
    otherLinks: row.other_links || [],
    visited: row.visited || false,
    notes: row.notes || '',
  };
}

// camelCase JS → snake_case DB
function placeToDb(place) {
  const row = {};
  if (place.city !== undefined) row.city = place.city;
  if (place.name !== undefined) row.name = place.name;
  if (place.category !== undefined) row.category = place.category;
  if (place.description !== undefined) row.description = place.description;
  if (place.website !== undefined) row.website = place.website;
  if (place.googleMaps !== undefined) row.google_maps = place.googleMaps;
  if (place.otherLinks !== undefined) row.other_links = place.otherLinks;
  if (place.visited !== undefined) row.visited = place.visited;
  if (place.notes !== undefined) row.notes = place.notes;
  return row;
}

function dbToQuickLink(row) {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    url: row.url,
    sortOrder: row.sort_order || 0,
  };
}

function quickLinkToDb(link) {
  const row = {};
  if (link.category !== undefined) row.category = link.category;
  if (link.name !== undefined) row.name = link.name;
  if (link.url !== undefined) row.url = link.url;
  if (link.sortOrder !== undefined) row.sort_order = link.sortOrder;
  return row;
}

export function useSupabaseData() {
  const [places, setPlaces] = useState([]);
  const [quickLinks, setQuickLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [placesResult, linksResult] = await Promise.all([
        supabase.from('places').select('*').order('created_at'),
        supabase.from('quick_links').select('*').order('sort_order').order('created_at'),
      ]);

      if (placesResult.error) throw placesResult.error;
      if (linksResult.error) throw linksResult.error;

      setPlaces(placesResult.data.map(dbToPlace));
      setQuickLinks(linksResult.data.map(dbToQuickLink));
    } catch (err) {
      setError('Datan lataus epäonnistui.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Places CRUD

  const getPlacesByCity = useCallback(
    (cityKey) => places.filter((p) => p.city === cityKey),
    [places]
  );

  const addPlace = async (cityKey, place) => {
    const row = placeToDb({ ...place, city: cityKey });
    const { data, error } = await supabase.from('places').insert(row).select().single();
    if (error) throw error;
    setPlaces((prev) => [...prev, dbToPlace(data)]);
  };

  const updatePlace = async (id, updates) => {
    const row = placeToDb(updates);
    const { data, error } = await supabase.from('places').update(row).eq('id', id).select().single();
    if (error) throw error;
    setPlaces((prev) => prev.map((p) => (p.id === id ? dbToPlace(data) : p)));
  };

  const deletePlace = async (id) => {
    const { error } = await supabase.from('places').delete().eq('id', id);
    if (error) throw error;
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  // Quick Links CRUD

  const getGroupedQuickLinks = useCallback(() => {
    const groups = {};
    for (const link of quickLinks) {
      if (!groups[link.category]) {
        groups[link.category] = [];
      }
      groups[link.category].push(link);
    }
    return Object.entries(groups).map(([category, links]) => ({ category, links }));
  }, [quickLinks]);

  const addQuickLink = async (category, name, url) => {
    const maxOrder = quickLinks
      .filter((l) => l.category === category)
      .reduce((max, l) => Math.max(max, l.sortOrder), -1);

    const row = quickLinkToDb({ category, name, url, sortOrder: maxOrder + 1 });
    const { data, error } = await supabase.from('quick_links').insert(row).select().single();
    if (error) throw error;
    setQuickLinks((prev) => [...prev, dbToQuickLink(data)]);
  };

  const deleteQuickLink = async (id) => {
    const { error } = await supabase.from('quick_links').delete().eq('id', id);
    if (error) throw error;
    setQuickLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const deleteQuickLinkCategory = async (category) => {
    const { error } = await supabase.from('quick_links').delete().eq('category', category);
    if (error) throw error;
    setQuickLinks((prev) => prev.filter((l) => l.category !== category));
  };

  return {
    places,
    quickLinks,
    loading,
    error,
    fetchAll,
    getPlacesByCity,
    addPlace,
    updatePlace,
    deletePlace,
    getGroupedQuickLinks,
    addQuickLink,
    deleteQuickLink,
    deleteQuickLinkCategory,
  };
}
