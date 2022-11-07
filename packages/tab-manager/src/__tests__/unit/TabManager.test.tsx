import {createRoot, Root} from "react-dom/client";
import {createRef, ReactNode, useCallback, useEffect, useMemo, useState} from "react";
import {$createTestTabNode, createTestTabManager} from "../utils";
import {TabManager} from "../../TabManager";

import * as ReactTestUtils from 'react-dom/test-utils';
import {$createWindowNode, $getRoot, TabGroupNode, WindowNode} from "@meogic/tab-manager";
import {$createResizableTabGroupNode, ResizableTabGroupNode} from "@meogic/tab-manager-resizable";
import {$createTabGroupBarNode} from "@meogic/tab-manager-tab-group-bar";
import {createPortal} from "react-dom";

describe('TabManager tests', function () {
    let container: HTMLElement | undefined = undefined
    let reactRoot: Root;

    beforeEach(() => {
        container = document.createElement('div')
        reactRoot = createRoot(container)
        document.body.appendChild(container)
    })

    afterEach(function () {
        document.body.removeChild(container!)
        container = undefined

        jest.resetAllMocks()
    });

    function useTabManager(rootElementRef, onError) {
        const tabManager = useMemo(
            () =>
                createTestTabManager({
                    nodes: [],
                    onError: onError || jest.fn(),
                    theme: {
                        tab: 'tab-manager-tab'
                    }
                }),
        [onError]
        )
        useEffect(() => {
            const rootElement = rootElementRef.current;
            tabManager.setRootElement(rootElement)
        }, [rootElementRef, tabManager])

        return tabManager
    }

    let tabManager: TabManager | undefined = undefined

    function init(onError?: () => void) {
        const ref = createRef<HTMLDivElement>()
        function TestBase() {
            tabManager = useTabManager(ref, onError);

            return <div ref={ref}/>
        }

        ReactTestUtils.act(() => {
            reactRoot.render(<TestBase/>)
        })
    }

    async function update(fn: any) {
        tabManager!.update(fn);

        return Promise.resolve().then();
    }

    it('Should be create and tabManager with an initial tabManager state', async () => {
        const rootElement = document.createElement('div');

        container!.appendChild(rootElement);

        const initialTabManager = createTestTabManager({
            onError: jest.fn(),
        });

        initialTabManager.update(() => {
            const root = $getRoot();
            const window = $createWindowNode()
            const tabGroupNode = $createResizableTabGroupNode()
            tabGroupNode.setActive(true)
            tabGroupNode.setPercent(33.33)
            const tabGroupBar = $createTabGroupBarNode()
            tabGroupNode.append(tabGroupBar)

            const tabGroupNode2 = $createResizableTabGroupNode()
            tabGroupNode2.setPercent(33.33)
            const tabGroupBar2 = $createTabGroupBarNode()
            tabGroupNode2.append(tabGroupBar2)

            const tabGroupNode3 = $createResizableTabGroupNode()
            tabGroupNode3.setPercent(33.33)
            const tabGroupBar3 = $createTabGroupBarNode()
            tabGroupNode3.append(tabGroupBar3)

            root.append(
                window.append(
                    tabGroupNode,
                    tabGroupNode2,
                    tabGroupNode3
                )
            )
        });

        initialTabManager.setRootElement(rootElement);

        // Wait for update to complete
        await Promise.resolve().then();

        expect(container.innerHTML).toBe(
            '<div><div style="display: flex; flex-direction: row;"><div style="flex-grow: 33.33;"><div data-tab-manager-resize-handle="true"></div><div></div></div><div style="flex-grow: 33.33;"><div data-tab-manager-resize-handle="true"></div><div></div></div><div style="flex-grow: 33.33;"><div data-tab-manager-resize-handle="true"></div><div></div></div></div></div>',
        );

    });

    it('Should handle nested updates in correct sequence', async () => {
        init()

        let log = []

        tabManager.update(
            () => {
                log.push('A1');
                // To enforce the update
                $getRoot().markDirty();
                tabManager.update(
                    () => {
                        log.push('B1');
                        tabManager.update(
                            () => {
                                log.push('C1');
                            },
                            {
                                onUpdate: () => {
                                    log.push('F1');
                                },
                            },
                        );
                    },
                    {
                        onUpdate: () => {
                            log.push('E1');
                        },
                    },
                );
            },
            {
                onUpdate: () => {
                    log.push('D1');
                },
            },
        );

        // Wait for update to complete
        // 为什么这里没有加上还能测试通过？
        // await Promise.resolve().then();

        expect(log).toEqual(['A1', 'B1', 'C1', 'D1', 'E1', 'F1']);
    })


    describe('parseTabManagerState', function () {

        it('should export json', async function () {
            init()
            await update(() => {
                const root = $getRoot();
                const window = $createWindowNode()
                const tabGroupNode = $createResizableTabGroupNode()
                tabGroupNode.setActive(true)
                tabGroupNode.setPercent(33.33)
                const tabGroupBar = $createTabGroupBarNode()
                tabGroupNode.append(tabGroupBar)

                const tabGroupNode2 = $createResizableTabGroupNode()
                tabGroupNode2.setPercent(33.33)
                const tabGroupBar2 = $createTabGroupBarNode()
                tabGroupNode2.append(tabGroupBar2)

                const tabGroupNode3 = $createResizableTabGroupNode()
                tabGroupNode3.setPercent(33.33)
                const tabGroupBar3 = $createTabGroupBarNode()
                tabGroupNode3.append(tabGroupBar3)

                root.append(
                    window.append(
                        tabGroupNode,
                        tabGroupNode2,
                        tabGroupNode3
                    )
                )
            });
            const stringifiedTabManagerState = JSON.stringify(tabManager.getTabManagerState());

            const parsedTabManagerStateFromObject = tabManager.parseTabManagerState(
                JSON.parse(stringifiedTabManagerState),
            );
            expect(JSON.stringify(parsedTabManagerStateFromObject))
                .toBe(stringifiedTabManagerState)


        });
    });

    describe('mutation', () => {
        it('listen tab group node add', async () => {
            init()
            const log = []
            tabManager.registerMutationListener(ResizableTabGroupNode, (nodes, payload) => {
                log.push('A1')
            })
            tabManager.registerMutationListener(WindowNode, (nodes, payload) => {
                log.push('B1')
            })
            update(() => {
                const root = $getRoot()
                const window = $createWindowNode()
                const tabGroupNode = $createResizableTabGroupNode()
                root.append(
                    window.append(
                        tabGroupNode
                    )
                )
            })
            expect(log).toStrictEqual(['A1', 'B1'])
        })
    })

    describe('With node decorators', () => {
        function useDecorators() {
            const [decorators, setDecorators] = useState(() =>
                tabManager.getDecorators<ReactNode>(),
            );

            // Subscribe to changes
            useEffect(() => {
                return tabManager.registerDecoratorListener<ReactNode>((nextDecorators) => {
                    setDecorators(nextDecorators);
                });
            }, []);

            const decoratedPortals = useMemo(
                () =>
                    Object.keys(decorators).map((nodeKey) => {
                        const reactDecorator = decorators[nodeKey];
                        const element = tabManager.getElementByKey(nodeKey);

                        return createPortal(reactDecorator, element);
                    }),
                [decorators],
            );

            return decoratedPortals;
        }

        it('Should correctly render React component into TabManager node #1', async () => {
            const listener = jest.fn();

            function Test() {
                tabManager = useMemo(() => createTestTabManager(), []);

                useEffect(() => {
                    tabManager.registerDecoratorListener(listener)
                }, []);

                const ref = useCallback((node) => {
                    tabManager.setRootElement(node);
                }, []);

                const decorators = useDecorators();

                return (
                    <>
                        <div ref={ref}/>
                        {decorators}
                    </>
                );
            }

            ReactTestUtils.act(() => {
                reactRoot.render(<Test />);
            });
            // Update the editor with the decorator
            await ReactTestUtils.act(async () => {
                await tabManager.update(() => {
                    const root = $getRoot()
                    const window = $createWindowNode()
                    const tabGroupNode = $createResizableTabGroupNode()
                    const tabNode =  $createTestTabNode()
                    root.append(
                        window.append(
                            tabGroupNode
                                .append(tabNode)
                        )
                    )
                });
            });

            expect(listener).toHaveBeenCalledTimes(1);
            expect(container.innerHTML).toBe(
                '<div><div style="display: flex; flex-direction: row;"><div style="flex-grow: 100;"><div data-tab-manager-resize-handle="true"></div><div data-tab-manager-tab="true"><span>Hello world</span></div></div></div></div>',
            );
        });

    });
});
