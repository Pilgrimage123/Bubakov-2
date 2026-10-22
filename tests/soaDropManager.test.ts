  it('keeps a retained merge value when matching drops are separated by unrelated drops', () => {
    manager.spawn({ type: 'gingerbread', x: 10, y: 10, value: 2 });
    manager.spawn({ type: 'coin', x: 800, y: 800, value: 1 });
    manager.spawn({ type: 'gingerbread', x: 20, y: 20, value: 2 });
    manager.spawn({ type: 'coin', x: 1000, y: 1000, value: 3 });
    manager.spawn({ type: 'gingerbread', x: 30, y: 30, value: 2 });

    const incoming = manager.spawn({ type: 'gingerbread', x: 40, y: 40, value: 2 });

    expect(incoming).toBeNull();
    expect(manager.count).toBe(3);
    const combinedIndex = Array.from(manager.itemTypes.slice(0, manager.count)).findIndex((typeIndex, index) =>
      typeIndex === 2 && manager.values[index] === 7
    );
    expect(combinedIndex).toBeGreaterThanOrEqual(0);
    expect(manager.itemTypes[combinedIndex]).toBe(2);
    expect(manager.values[combinedIndex]).toBe(7);
    expect(Array.from(manager.values.slice(0, manager.count))).toContain(1);
    expect(Array.from(manager.values.slice(0, manager.count))).toContain(3);
  });