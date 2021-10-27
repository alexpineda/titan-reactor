import "reflect-metadata";

const components: Map<any, any> = new Map();

export const getComponent: <T>(key: T) => T = (key) => {
  const component = components.get(key);
  return component;
};

export const registerComponent: <T>(key: T, component: T) => void = (
  key,
  component
) => components.set(key, component);

export function component(target: any, propertyKey: string) {
  const type = Reflect.getOwnMetadata("design:type", target, propertyKey);
  return getComponent<typeof type>(type);
}
