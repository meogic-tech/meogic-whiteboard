import { Rect } from "@meogic/whiteboard/src/model/Rect";


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
})
