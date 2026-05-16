import { db } from './db';
import type { Material, PersonalInfo, SignatureData } from './types';

export async function getMaterials(
  type?: 'personal_info' | 'signature'
): Promise<Material[]> {
  if (type) {
    return db.materials.where('type').equals(type).toArray();
  }
  return db.materials.toArray();
}

export async function getMaterial(
  id: number
): Promise<Material | undefined> {
  return db.materials.get(id);
}

export async function addMaterial(data: {
  name: string;
  type: 'personal_info' | 'signature';
  data: PersonalInfo | SignatureData;
}): Promise<number> {
  return db.materials.add({
    name: data.name,
    type: data.type,
    data: data.data,
    createdAt: new Date(),
  });
}

export async function updateMaterial(
  id: number,
  data: Partial<Material>
): Promise<void> {
  await db.materials.update(id, data);
}

export async function deleteMaterial(id: number): Promise<void> {
  await db.materials.delete(id);
}
