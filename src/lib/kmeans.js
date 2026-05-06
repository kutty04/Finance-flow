export function kmeans(points, k = 3, maxIter = 100) {
  if (!points || points.length === 0) return [];
  if (points.length < k) k = points.length;

  // points = [{ x: amount, y: dayOfMonth, label: description }]
  let centroids = points.slice(0, k).map(p => ({ x: p.x, y: p.y }));

  for (let iter = 0; iter < maxIter; iter++) {
    const clusters = Array.from({ length: k }, () => []);

    for (const point of points) {
      let minDist = Infinity, nearest = 0;
      centroids.forEach((c, i) => {
        const d = Math.hypot(point.x - c.x, point.y - c.y);
        if (d < minDist) { minDist = d; nearest = i; }
      });
      clusters[nearest].push(point);
    }

    const newCentroids = clusters.map(cluster => {
      if (!cluster.length) return { x: 0, y: 0 };
      return {
        x: cluster.reduce((s, p) => s + p.x, 0) / cluster.length,
        y: cluster.reduce((s, p) => s + p.y, 0) / cluster.length,
      };
    });

    const moved = newCentroids.some((c, i) =>
      Math.hypot(c.x - centroids[i].x, c.y - centroids[i].y) > 0.01
    );
    centroids = newCentroids;
    if (!moved) break;
  }

  return points.map(point => {
    let minDist = Infinity, cluster = 0;
    centroids.forEach((c, i) => {
      const d = Math.hypot(point.x - c.x, point.y - c.y);
      if (d < minDist) { minDist = d; cluster = i; }
    });
    return { ...point, cluster };
  });
}
