import TitanSprite from "../../core/titan-sprite";

export const updateEntities = (
  entities: TitanSprite[],
  delta: number,
  cameraDirection: number,
  removeTitanSprite: (sprite: TitanSprite) => void
) => {
  const removeEntities: TitanSprite[] = [];

  for (const entity of entities) {
    if (entity.mainImage) {
      if (entity.userData.direction !== cameraDirection) {
        entity.setDirection(cameraDirection);
      }
      //@todo return list of new entities and process them!!
      entity.update(delta, cameraDirection);
    }
    if (entity.images.length === 0) {
      removeEntities.push(entity);
    }
  }

  removeEntities.forEach(removeTitanSprite);

  return entities.filter((entity) => !removeEntities.includes(entity));
};
