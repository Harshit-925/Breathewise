import { useApp } from '../context/AppContext.js';
import type { Persona, BuildingType } from '../types/index.js';

export function useHousehold() {
  const { household, setHousehold } = useApp();

  const addMember = (persona: Persona) => {
    setHousehold({
      ...household,
      members: [...household.members, persona],
    });
  };

  const removeMember = (index: number) => {
    setHousehold({
      ...household,
      members: household.members.filter((_, i) => i !== index),
    });
  };

  const updateBuilding = (buildingType: BuildingType, roomVolume: number) => {
    setHousehold({
      ...household,
      buildingType,
      roomVolume,
    });
  };

  const updatePurifier = (hasPurifier: boolean, purifierCadr?: number) => {
    setHousehold({
      ...household,
      hasPurifier,
      purifierCadr,
    });
  };

  return {
    household,
    setHousehold,
    addMember,
    removeMember,
    updateBuilding,
    updatePurifier,
  };
}
