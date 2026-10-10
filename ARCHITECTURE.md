# Architecture

The map an agent needs before changing structure: the layers, which way dependencies point, and the one interface each cross-cutting concern goes through. Be strict about these boundaries and loose about how code inside a layer is written.

## Layers

<!-- One row per layer, lowest first. The `layers` guard reads the same layers from scripts/checks/layers.json; keep the two in step. Example for a web app: types, config, data access, services, API, UI. -->

| Layer | Where it lives | May import |
|---|---|---|

## Dependency direction

Dependencies point down the table: a layer imports only the layers its row lists. The `layers` guard fails an import that points up or sideways, and its message names the layer to go through instead.

## Cross-cutting concerns

Each concern has one interface, and code reaches it only through that interface:

<!-- One line each: auth, logging and telemetry, feature flags, configuration, and any other concern code everywhere needs. Name the module or function. -->
