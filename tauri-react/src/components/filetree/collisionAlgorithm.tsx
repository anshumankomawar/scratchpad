import type {
  CollisionDetection,
  UniqueIdentifier,
} from "@dnd-kit/core";

/**
 * Returns the intersecting rectangle area between two rectangles
 */
function getIntersectionRatio(entry, target): number {
  // console.log(entry, target)
  const top = Math.max(target.top, entry.offsetTop);
  const left = Math.max(target.left, entry.offsetLeft);
  const right = Math.min(
    target.left + target.width,
    entry.offsetLeft + entry.width
  );
  const bottom = Math.min(
    target.top + target.height,
    entry.offsetTop + entry.height
  );
  const width = Math.abs(right - left);
  const height = Math.abs(bottom - top);

  if (left < right && top < bottom) {
    const targetArea = target.width * target.height;
    const entryArea = entry.width * entry.height;
    const intersectionArea = width * height;
    const intersectionRatio =
      intersectionArea / (targetArea + entryArea - intersectionArea);

    const ratio = Number(intersectionRatio.toFixed(4));
    return ratio;
  }

  // Rectangles do not overlap, or overlap has an area of zero (edge/corner overlap)
  return 0;
}

export const customRectIntersection: CollisionDetection = (args) => {
  const {
    active,
    collisionRect,
    droppableContainers
  } = args;
  let maxIntersectionRatio = 0;
  let maxIntersectingDroppableContainer: UniqueIdentifier | null = null;

  const { translated } = active.rect.current;

  // console.log(collisionRect, active.rect.current.initial, translated)

  if (!translated) return maxIntersectingDroppableContainer;

  for (let i = 0; i < droppableContainers.length; i += 1) {
    const droppableContainer = droppableContainers[i];
    const {
      rect: { current: rect }
    } = droppableContainer;

    if (rect) {
      const intersectionRatio = getIntersectionRatio(rect, translated);
      console.log(maxIntersectionRatio)

      if (intersectionRatio > maxIntersectionRatio) {
        maxIntersectionRatio = intersectionRatio;
        maxIntersectingDroppableContainer = droppableContainer.id;
      }
    }
  }

  return maxIntersectingDroppableContainer;
};
