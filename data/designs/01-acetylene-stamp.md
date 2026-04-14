# Acetylene stamp — 140/s pitch input

Consumes half the tar refinery's 280/s pitch output. Build 2× stamps.

## Recipe table

| Recipe | Factory | Count |
|---|---|---|
| pitch-refining | distilator | 7 |
| lime | hpf | 2 |
| calcium-carbide | hpf | 6 |
| acetylene | gasifier | 12 |
| slacked-lime-void | evaporator | 2 |
| oil-boiler-mk01 | (burner) | 5 |
| **TOTAL** | | **34** |

25 MW electric (oil boilers self-powered)

## Stations (4)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| pitch | unload | pitch (fluid) | 140 |
| limestone | unload | limestone (item) | 2.36 |
| water | unload | water (fluid) | 448 |
| acetylene | load | acetylene (fluid) | 114.7 net |

## Self-power

5 oil-boiler-mk01 burn **34.6/s acetylene** (the main product) → 140/s steam at 250°C for pitch-refining. Net acetylene export: 114.7/s per stamp.

## Intermediates

| Item | Rate/s | Producer | Consumer |
|---|---|---|---|
| coke | 14.0 | pitch-refining | lime 3.55/s, calcium-carbide 10.45/s |
| lime | 2.99 | lime (hpf) 2.36/s + slacked-lime-void 0.62/s | calcium-carbide |
| calcium-carbide | 14.93 | calcium-carbide (hpf) | acetylene (gasifier) |
| slacked-lime | 37.33 | acetylene (gasifier) | slacked-lime-void (evaporator) |
| steam | 140 | oil-boiler-mk01 | pitch-refining (distilator) |

## Byproducts (all voided)

| Byproduct | Rate/s | Void method |
|---|---|---|
| light-oil | 28.0 | sinkhole |
| anthracene-oil | 42.0 | sinkhole |
| naphthalene-oil | 28.0 | sinkhole |
| hydrogen | 14.0 | gas vent |
| carbon-dioxide | 23.6 | gas vent |
| gravel | 0.62 | pyvoid |

## Tile footprint

1,783 tiles (7×distilator 64 + 8×hpf 49 + 12×gasifier 64 + 2×evaporator 25 + 5×oil-boiler 25). Fits one city block.

## Totals (2× stamps)

- Pitch consumed: 280/s (all tar refinery output)
- Acetylene exported: 229.4/s net
- Limestone imported: 4.72/s
- Water imported: 896/s

## Helmod import string

```
eJzllb1uwyAUhXc/BfLcSHF+RpYO3br4BSIC18lVMLiA01pR3r3YITax1SpTE6mbOedeOPeTDEITqTmTZENPCSFcMmtp+q4FyPTFC0cwFrWii3bhsASatV9b33TYGK1d19Y3vrZ610gICppe6rKgKOb7UysZP4CYSb/b7KhRBNc1lXfDQn8qMP1q22wqo0XNHS2YtNCrBeNOmyZWrZY+dKzwPUphQIWohORZ/9knz4FjBeG8a/w8iwUl4IvOB+H3cYaRzHjrMEvLNRvUj5pJdA1NlTYlk1H9dcohdB/77WJFxddccGSVNsy7N+bPpxDCSl0rF49ISOmjSrD0dO7F8+BvgXGtIrf38sW9jBcTxtmYMePgGgkKnoTtjlksEB5Ednkv2eWE7GJM1v/6HOtyxpnZongWvvuqeAza1b1oVxO0yzHa9kL47zzX9/JcT3iuxjwrdHw/M1CgQrV7ErICrUP557dsElWEOVs7PLxqZ0AgqFYLHR28aLQI6YRkIeubVwxVVTuarea3pychQffGd+HOiQFXG0U2CSjxDXVVH6w=
```
