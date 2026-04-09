export function findReact(el, parent = 0, type = "props") {
  if (!el) {
    return null;
  }
  const reactInternal = Object.keys(el).find((key) =>
    key.startsWith("__reactFiber")
  );

  el = el[reactInternal];

  let found = [];

  while (found.length <= parent) {
    if ("stateNode" in el && el.stateNode && type in el.stateNode) {
      found.push(el.stateNode);
    }

    if ("return" in el && el.return) {
      el = el.return;
    } else {
      break;
    }
  }

  return found[parent] || null;
}

export function findMemoizedProps(el, predicate = null, maxDepth = 25) {
  if (!el) {
    return null;
  }

  const reactInternal = Object.keys(el).find((key) =>
    key.startsWith("__reactFiber")
  );

  if (!reactInternal) {
    return null;
  }

  let fiber = el[reactInternal];
  let depth = 0;

  while (fiber && depth <= maxDepth) {
    const props = fiber.memoizedProps;

    if (props && (!predicate || predicate(props, fiber, depth))) {
      return props;
    }

    fiber = fiber.return;
    depth += 1;
  }

  return null;
}

export function findStateComponent(el, predicate = null, maxDepth = 25) {
  if (!el) {
    return null;
  }

  const reactInternal = Object.keys(el).find((key) =>
    key.startsWith("__reactFiber")
  );

  if (!reactInternal) {
    return null;
  }

  let fiber = el[reactInternal];
  let depth = 0;

  while (fiber && depth <= maxDepth) {
    const stateNode = fiber.stateNode;

    if (
      stateNode &&
      stateNode.state &&
      (!predicate || predicate(stateNode.state, stateNode, fiber, depth))
    ) {
      return stateNode;
    }

    fiber = fiber.return;
    depth += 1;
  }

  return null;
}

export function findState(el, parent = 0) {
  return findReact(el, parent, "state").state;
}

export function findProps(el, parent = 0) {
  return findReact(el, parent).props;
}

window.findReact = findReact;
