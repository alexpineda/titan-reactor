import IScriptSprite from "./iscript-sprite";

export const updateEntities = (
  entities: IScriptSprite[],
  delta: number,
  cameraDirection: number,
  removeTitanSprite: (sprite: IScriptSprite) => void
) => {
  const removeEntities: IScriptSprite[] = [];

  for (const entity of entities) {
    if (entity.mainImage) {
      if (entity.userData.direction !== cameraDirection) {
        entity.setDirection(cameraDirection);
      }
      //@todo return list of new entities and process them!!
      entity.update(delta, cameraDirection);
    }
    if (entity.iscriptImages.length === 0) {
      removeEntities.push(entity);
    }
  }

  removeEntities.forEach(removeTitanSprite);

  return entities.filter((entity) => !removeEntities.includes(entity));
};
