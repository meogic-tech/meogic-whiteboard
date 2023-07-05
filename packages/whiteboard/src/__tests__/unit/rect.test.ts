import { Rect } from '@meogic/whiteboard/src/model/Rect';


describe('rect', () => {
  it('extendWithRect1', () => {
    const rect1 = new Rect(0, 0, 50, 50)
    const rect2 = new Rect(20, 20, 50, 50)
    const r = rect1.extendWithRect(rect2);
    expect(r).toEqual(new Rect(0, 0, 70, 70))
  })
  it('extendWithRect2', () => {
    const rect1 = new Rect(0, 0, 50, 50)
    const rect2 = new Rect(100, 100, 50, 50)
    const r = rect1.extendWithRect(rect2);
    expect(r).toEqual(new Rect(0, 0, 150, 150))
  })
  it('extendWithRect3', () => {
    const rect1 = new Rect(0, 0, 50, 50)
    const rect2 = new Rect(100, 100, 50, 50)
    const r = rect2.extendWithRect(rect1);
    expect(r).toEqual(new Rect(0, 0, 150, 150))
  })
  it('extend', () => {
    const rect1 = new Rect(0, 0, 50, 50)
    rect1.extend(10);
    expect(rect1).toEqual(new Rect(-10, -10, 70, 70))
  })
  it('interactRect', () => {
    const rect1 = new Rect(0, 20, 50, 20)
    const rect2 = new Rect(10, 10, 20, 50)
    expect(rect1.interactRect(rect2)).toEqual(true)
    expect(rect2.interactRect(rect1)).toEqual(true)
  })
})

describe('Rect', () => {
  describe('distance', () => {
    it('should return 0 for identical rectangles', () => {
      const rect = new Rect(0, 0, 10, 10);
      expect(rect.distance(rect)).toEqual(-0);
    });

    it('should return correct distance for non-overlapping rectangles', () => {
      const rect1 = new Rect(0, 0, 10, 10);
      const rect2 = new Rect(20, 0, 10, 10);
      expect(rect1.distance(rect2)).toEqual(10);
    });

    it('should return correct distance for rectangles with shared edge', () => {
      const rect1 = new Rect(0, 0, 10, 10);
      const rect2 = new Rect(10, 0, 10, 10);
      expect(rect1.distance(rect2)).toEqual(0);
    });

    it('should return correct distance for rectangles with common corner', () => {
      const rect1 = new Rect(0, 0, 10, 10);
      const rect2 = new Rect(10, 10, 10, 10);
      expect(rect1.distance(rect2)).toEqual(0);
    });

    it('should return correct distance for vertically aligned rectangles', () => {
      const rect1 = new Rect(0, 0, 10, 10);
      const rect2 = new Rect(0, 20, 10, 10);
      expect(rect1.distance(rect2)).toEqual(10);
    });

    it('should return correct distance for horizontally aligned rectangles', () => {
      const rect1 = new Rect(0, 0, 10, 10);
      const rect2 = new Rect(20, 0, 10, 10);
      expect(rect1.distance(rect2)).toEqual(10);
    });

    it('should return correct distance for horizontally aligned rectangles', () => {
      const rect1 = new Rect(0, 0, 10, 10);
      const rect2 = new Rect(-20, 0, 10, 10);
      expect(rect1.distance(rect2)).toEqual(10);
    });

    it('should return correct distance for rectangles with different sizes', () => {
      const rect1 = new Rect(0, 0, 10, 10);
      const rect2 = new Rect(15, 15, 20, 20);
      expect(rect1.distance(rect2)).toEqual(5 * Math.sqrt(2));
    });

    it('should return correct distance for rectangles with negative coordinates', () => {
      const rect1 = new Rect(-20, -20, 10, 10);
      const rect2 = new Rect(0, 0, 10, 10);
      expect(rect1.distance(rect2)).toEqual(10 * Math.sqrt(2));
    });

    it('should return correct distance for overlapping rectangles', () => {
      const rect1 = new Rect(0, 0, 10, 10);
      const rect2 = new Rect(5, 5, 10, 10);
      expect(rect1.distance(rect2)).toEqual(-7.0710678118654755);
    });
  });
});

