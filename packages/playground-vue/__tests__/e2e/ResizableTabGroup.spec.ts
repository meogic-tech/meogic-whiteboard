import {expect, test} from "@playwright/test";
import {Page} from "playwright";

test.beforeEach(async ({page}) => {
    const url = `http://localhost:3000/`
    await page.goto(url, {waitUntil: 'load'})
    await expect(page).toHaveTitle('TabManager Playground')
})

async function resize(page: Page, index: number){
    const resize = page.locator('.PlaygroundTabManagerTheme__tab-group-resize-handle').nth(index);
    const rect = await resize.evaluate((node) => {
        return node.getBoundingClientRect()
    })
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2)
    await page.mouse.down()
    await page.mouse.move(rect.x + rect.width / 2 - 100, rect.y + rect.height / 2)
    await page.mouse.up()
}

test('resize test', async ({page}) => {
    await resize(page, 0)

    const tabGroup = page.locator('.PlaygroundTabManagerTheme__tab-group').nth(0)
    const tabGroupRect = await tabGroup.evaluate((node) => {
        return node.getBoundingClientRect()
    })
    await expect(tabGroupRect.width).toBe(244.578125)
})

test('resize another test', async ({page}) => {
    const tabGroup1 = page.locator('.PlaygroundTabManagerTheme__tab-group').nth(1)
    const tabGroup1Rect0 = await tabGroup1.evaluate((node) => {
        return node.getBoundingClientRect()
    })
    await expect(tabGroup1Rect0.width).toBe(343.9765625)

    await resize(page, 0)

    const tabGroup1Rect1 = await tabGroup1.evaluate((node) => {
        return node.getBoundingClientRect()
    })
    await expect(tabGroup1Rect1.width).toBe(443.40625)

    await resize(page, 1)

    const tabGroup1Rect2 = await tabGroup1.evaluate((node) => {
        return node.getBoundingClientRect()
    })
    await expect(tabGroup1Rect2.width).toBe(343.3125)
})
