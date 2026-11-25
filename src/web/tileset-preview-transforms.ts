import { Matrix4 } from '@math.gl/core';
import { Ellipsoid } from '@math.gl/geospatial';

type Tile = {
  transform?: number[];
  boundingVolume: { region?: [number, number, number, number, number, number] };
  children?: Tile[];
};

function hasEarthScaleOrigin(transform: Matrix4) {
  const radius = Math.hypot(...transform.getTranslation());
  return radius > 6_000_000 && radius < 7_000_000;
}

function originMatchesRegion(transform: Matrix4, region: NonNullable<Tile['boundingVolume']['region']>, margin: number) {
  if (!hasEarthScaleOrigin(transform)) return false;
  const [longitude, latitude, height] = Ellipsoid.WGS84.cartesianToCartographic(transform.getTranslation());
  const [west, south, east, north, minHeight, maxHeight] = region;
  const turn = 2 * Math.PI;
  const span = east < west ? east + turn - west : east - west;
  const delta = (longitude! * Math.PI / 180 - west + turn + margin) % turn;
  const lat = latitude! * Math.PI / 180;
  return delta <= span + 2 * margin && lat >= south - margin && lat <= north + margin
    && height! >= minHeight - margin * 6_378_137 && height! <= maxHeight + margin * 6_378_137;
}

// Some exporters write an absolute Earth-fixed transform for each child.
// Repair only children whose absolute origin fits the geographic region
// and whose normal parent-relative origin is far outside it.
export function repairPreviewTransforms(root: Tile): boolean {
  let changed = false;
  const pending: { tile: Tile; parent?: Matrix4 }[] = [{ tile: root }];
  while (pending.length) {
    const { tile, parent } = pending.pop()!;
    const local = new Matrix4(tile.transform);
    let world = parent ? parent.clone().multiplyRight(local) : local;
    const region = tile.boundingVolume.region;
    if (tile.transform && region && parent && hasEarthScaleOrigin(parent)
      && originMatchesRegion(local, region, 0.00008)
      && !originMatchesRegion(world, region, 0.0008)
      && Math.abs(parent.determinant()) > 1e-12) {
      tile.transform = [...parent.clone().invert().multiplyRight(local)];
      world = local;
      changed = true;
    }
    for (const child of tile.children ?? []) pending.push({ tile: child, parent: world });
  }
  return changed;
}
