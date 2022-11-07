import {expect, test} from "@playwright/test";
import {Page} from "playwright";

test.beforeEach(async ({page}) => {
    const url = `http://localhost:3000/`
    await page.goto(url, {waitUntil: 'load'})
    await expect(page).toHaveTitle('TabManager Playground')
})

async function moveBarItem(page: Page, index: number){
    const tabGroupBarItem = page.locator('.PlaygroundTabManagerTheme__tab-group-bar-item').nth(0)
    const tabGroupBarItemRect = await tabGroupBarItem.evaluate((node) => {
        return node.getBoundingClientRect()
    })
    const newX = tabGroupBarItemRect.x + tabGroupBarItemRect.width / 2;
    const newY = tabGroupBarItemRect.y + tabGroupBarItemRect.height / 2;
    await page.mouse.move(newX, newY)
    await page.mouse.down()

    await page.mouse.move(newX + 300, newY)

    await expect(await page.locator('.PlaygroundTabManagerTheme__tab-group-cover')).toBeVisible({timeout: 500})

    await page.mouse.up()

}


test('draggable', async ({page}) => {
    await page.locator('text=Jenny').click();

    await page.locator('.PlaygroundTabManagerTheme__tab-group-bar-item').click();

    await moveBarItem(page, 0)

    const tabGroupBar0 = await page.locator('.PlaygroundTabManagerTheme__tab-group-bar').nth(0)
    await expect(await tabGroupBar0.innerHTML()).toBe('')

    const tabGroupBar1 = await page.locator('.PlaygroundTabManagerTheme__tab-group-bar').nth(1)

    await expect(await tabGroupBar1.innerHTML()).toBe('<div class="PlaygroundTabManagerTheme__tab-group-bar-item PlaygroundTabManagerTheme__active"><div class="PlaygroundTabManagerTheme__tab-group-bar-item-text">Jenny</div><button class="PlaygroundTabManagerTheme__tab-group-bar-item-button"><img src="/@fs/Users/wing/Develop/meogic-tab-manager/packages/tab-manager-tab-group-bar/src/assets/close.svg" alt="close"></button></div>')
})


test('draggable twice', async ({page}) => {
    await page.locator('text=Jenny').click();
    await page.locator('text=John').click();

    await page.locator('.PlaygroundTabManagerTheme__tab-group-bar-item').nth(0).click();

    await moveBarItem(page, 0)

    const tabGroupBar0 = await page.locator('.PlaygroundTabManagerTheme__tab-group-bar').nth(0)
    await expect(await tabGroupBar0.innerHTML()).toBe('<div class="PlaygroundTabManagerTheme__tab-group-bar-item PlaygroundTabManagerTheme__active"><div class="PlaygroundTabManagerTheme__tab-group-bar-item-text">John</div><button class="PlaygroundTabManagerTheme__tab-group-bar-item-button"><img src="/@fs/Users/wing/Develop/meogic-tab-manager/packages/tab-manager-tab-group-bar/src/assets/close.svg" alt="close"></button></div>')

    const tabGroupBar1 = await page.locator('.PlaygroundTabManagerTheme__tab-group-bar').nth(1)
    await expect(await tabGroupBar1.innerHTML()).toBe('<div class="PlaygroundTabManagerTheme__tab-group-bar-item PlaygroundTabManagerTheme__active"><div class="PlaygroundTabManagerTheme__tab-group-bar-item-text">Jenny</div><button class="PlaygroundTabManagerTheme__tab-group-bar-item-button"><img src="/@fs/Users/wing/Develop/meogic-tab-manager/packages/tab-manager-tab-group-bar/src/assets/close.svg" alt="close"></button></div>')

    await expect((await page.locator('pre').innerHTML()).trim()).toBe(
    `root
  └ (1) window  {"active":false}
    ├ (2) resizable-tab-group  {"active":false}
    | ├ (3) tab-group-bar  {"active":false}
    | | └ (11) tab-group-bar-item  {"active":true}
    | └ (10) user-tab  {"active":true}
    ├ (4) resizable-tab-group  {"active":true}
    | ├ (5) tab-group-bar  {"active":false}
    | | └ (12) tab-group-bar-item  {"active":true}
    | └ (8) user-tab  {"active":true}
    └ (6) resizable-tab-group  {"active":false}
      └ (7) tab-group-bar  {"active":false}`)



    await moveBarItem(page, 0)

    await expect((await page.locator('pre').innerHTML()).trim()).toBe(
        `root
  └ (1) window  {"active":false}
    ├ (2) resizable-tab-group  {"active":false}
    | └ (3) tab-group-bar  {"active":false}
    ├ (4) resizable-tab-group  {"active":true}
    | ├ (5) tab-group-bar  {"active":false}
    | | ├ (12) tab-group-bar-item  {"active":false}
    | | └ (13) tab-group-bar-item  {"active":true}
    | ├ (8) user-tab  {"active":false}
    | └ (10) user-tab  {"active":true}
    └ (6) resizable-tab-group  {"active":false}
      └ (7) tab-group-bar  {"active":false}`)


    await moveBarItem(page, 0)

    await expect((await page.locator('pre').innerHTML()).trim()).toBe(
        `root
  └ (1) window  {"active":false}
    ├ (2) resizable-tab-group  {"active":false}
    | └ (3) tab-group-bar  {"active":false}
    ├ (4) resizable-tab-group  {"active":false}
    | ├ (5) tab-group-bar  {"active":false}
    | | └ (13) tab-group-bar-item  {"active":true}
    | └ (10) user-tab  {"active":true}
    └ (6) resizable-tab-group  {"active":true}
      ├ (7) tab-group-bar  {"active":false}
      | └ (14) tab-group-bar-item  {"active":true}
      └ (8) user-tab  {"active":true}`)


    await moveBarItem(page, 0)

    await expect((await page.locator('pre').innerHTML()).trim()).toBe(
        `root
  └ (1) window  {"active":false}
    ├ (2) resizable-tab-group  {"active":false}
    | └ (3) tab-group-bar  {"active":false}
    ├ (4) resizable-tab-group  {"active":false}
    | └ (5) tab-group-bar  {"active":false}
    └ (6) resizable-tab-group  {"active":true}
      ├ (7) tab-group-bar  {"active":false}
      | ├ (14) tab-group-bar-item  {"active":false}
      | └ (15) tab-group-bar-item  {"active":true}
      ├ (8) user-tab  {"active":false}
      └ (10) user-tab  {"active":true}`)
})
