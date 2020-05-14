# MockSynth

**Source:** [contracts/test-helpers/MockSynth.sol](https://github.com/Synthetixio/synthetix/tree/develop/contracts/test-helpers/MockSynth.sol)

## Architecture

### Inheritance Graph

```mermaid
graph TD
    MockSynth[MockSynth] --> ExternStateToken[ExternStateToken]
    ExternStateToken[ExternStateToken] --> SelfDestructible[SelfDestructible]
    ExternStateToken[ExternStateToken] --> Proxyable[Proxyable]
    SelfDestructible[SelfDestructible] --> Owned[Owned]
    Proxyable[Proxyable] --> Owned[Owned]
```

---

## Variables

---

### `currencyKey`
<sub>[Source](https://github.com/Synthetixio/synthetix/tree/develop/contracts/test-helpers/MockSynth.sol#L11)</sub>

**Type:** `bytes32`

## Functions

---

### `constructor`
<sub>[Source](https://github.com/Synthetixio/synthetix/tree/develop/contracts/test-helpers/MockSynth.sol#L13)</sub>

??? example "Details"

    **Signature**

    `(address payable _proxy, contract TokenState _tokenState, string _name, string _symbol, uint256 _totalSupply, address _owner, bytes32 _currencyKey) public`

    **Modifiers**

    * [ExternStateToken](#externstatetoken)

---

### `setSystemStatus`
<sub>[Source](https://github.com/Synthetixio/synthetix/tree/develop/contracts/test-helpers/MockSynth.sol#L26)</sub>

??? example "Details"

    **Signature**

    `setSystemStatus(contract ISystemStatus _status) external`

---

### `setTotalSupply`
<sub>[Source](https://github.com/Synthetixio/synthetix/tree/develop/contracts/test-helpers/MockSynth.sol#L31)</sub>

??? example "Details"

    **Signature**

    `setTotalSupply(uint256 _totalSupply) external`

---

### `transfer`
<sub>[Source](https://github.com/Synthetixio/synthetix/tree/develop/contracts/test-helpers/MockSynth.sol#L35)</sub>

??? example "Details"

    **Signature**

    `transfer(address to, uint256 value) external`

    **Modifiers**

    * [optionalProxy](#optionalproxy)

---

### `transferFrom`
<sub>[Source](https://github.com/Synthetixio/synthetix/tree/develop/contracts/test-helpers/MockSynth.sol#L41)</sub>

??? example "Details"

    **Signature**

    `transferFrom(address from, address to, uint256 value) external`

    **Modifiers**

    * [optionalProxy](#optionalproxy)

---

### `issue`
<sub>[Source](https://github.com/Synthetixio/synthetix/tree/develop/contracts/test-helpers/MockSynth.sol#L56)</sub>

??? example "Details"

    **Signature**

    `issue(address account, uint256 amount) external`

    **Emits**

    * [Issued](#issued)

---

### `burn`
<sub>[Source](https://github.com/Synthetixio/synthetix/tree/develop/contracts/test-helpers/MockSynth.sol#L62)</sub>

??? example "Details"

    **Signature**

    `burn(address account, uint256 amount) external`

    **Emits**

    * [Burned](#burned)

---

## Events

---

### `Issued`
<sub>[Source](https://github.com/Synthetixio/synthetix/tree/develop/contracts/test-helpers/MockSynth.sol#L51)</sub>

- `(address account, uint256 value)`

---

### `Burned`
<sub>[Source](https://github.com/Synthetixio/synthetix/tree/develop/contracts/test-helpers/MockSynth.sol#L53)</sub>

- `(address account, uint256 value)`

---
