# Macros

Macros are the main avenue to interact with the system, this can mean pausing/playing replays, following units, changing cameras, etc. The macro list is on the left side. There is a textbox where you can create a new macro.

![macro1](https://github.com/imbateam-gg/titan-reactor/assets/586716/c40c04a7-4145-42e0-b947-0010c005e1c5)

Macros have triggers, conditions and actions. When a trigger is activated, conditions are tested and if they pass, the actions are executed.

## Trigger Types
Specifies what triggers the macro.

![image](https://github.com/imbateam-gg/titan-reactor/assets/586716/b40bbecc-ef0f-4fcd-97e2-fd68c8c09b42)

- **None**: No trigger. Must be run manually

![image](https://github.com/imbateam-gg/titan-reactor/assets/586716/618d22c7-643f-471f-ba45-e35e5cee1252)

- **Hotkey**: Triggered by a keyboard shortcut.

![image](https://github.com/imbateam-gg/titan-reactor/assets/586716/3becd71c-6c80-42c8-992d-a19c05c6fdeb)


Enter a key in the key textbox to change the key. Key combinations are allowed. The key preview will show on the right side.

- **WorldEvent**: Triggered by an event within the Starcraft world.
 
![image](https://github.com/imbateam-gg/titan-reactor/assets/586716/c1e2209c-1c0d-4bb8-82c3-108051339255)

## Conditions

### Target Type

![image](https://github.com/imbateam-gg/titan-reactor/assets/586716/d89e4d5c-f515-431e-8d37-43cf6ef7cdfd)

Specifies the target for the macro condition, whether an app setting, plugin setting, a custom function or another macro.

### App Conditions
Most app settings are available to use as a condition.
![image](https://github.com/imbateam-gg/titan-reactor/assets/586716/86798afa-fea8-41de-a9f9-4ac23dcc2161)

Depending on the type of the setting, different comparators are allowed.
![image](https://github.com/imbateam-gg/titan-reactor/assets/586716/bae6b15a-c85c-441f-be8f-4b7922dfc2e0)

### Plugin Conditions
Plugin settings works similar to App Settings condiiton except that the plugin must be selected first.
![image](https://github.com/imbateam-gg/titan-reactor/assets/586716/f1e2c9a8-3870-4fab-8a49-c3bffeb2332b)

Any plugin setting is then available as a condition

![image](https://github.com/imbateam-gg/titan-reactor/assets/586716/fb752c11-b1d0-4072-809e-9755403f3cab)

### Macro Conditions

The macro target lets you test whether a macro is enabled or disabled.

![image](https://github.com/imbateam-gg/titan-reactor/assets/586716/ed3c7a61-b475-4308-ac4c-638231799e0b)


### Function Conditions

The function condition lets you code against the api and return either true or false as a condition.

![image](https://github.com/imbateam-gg/titan-reactor/assets/586716/83261f23-1b07-4f73-b275-c05180810c95)


## Actions

Actions behave similar to conditions except that they CHANGE values rather than test them. The changes belong to the game session only and are not saved after the map or replay is finished.

### Target Type

![image](https://github.com/imbateam-gg/titan-reactor/assets/586716/10e08264-7b4e-4552-b880-d8ec23c0fa3f)

Specifies the target for the macro action, whether an app setting, plugin setting, a custom function or another macro.

### App Actions
Most app settings are available to use as an action.
![image](https://github.com/imbateam-gg/titan-reactor/assets/586716/42b8bb45-f340-4ac1-afdd-c4838ebc7490)

Depending on the type of the setting, different operators are allowed.
![image](https://github.com/imbateam-gg/titan-reactor/assets/586716/0472b87b-0bf9-4f09-93ed-3bbb9748890e)

Set to Default will revert to what the user has set in the Plugin Configuration section.

The operators are detailed in a section further below.

### Plugin Actions
Plugin settings works similar to App Settings action except that the plugin must be selected first.
![image](https://github.com/imbateam-gg/titan-reactor/assets/586716/93eb8aed-6c2f-4ded-ae6e-c28c637339a0)


Any plugin setting is then available as an action

![image](https://github.com/imbateam-gg/titan-reactor/assets/586716/27845aa7-60ca-4c89-b2e6-bcf25f5d364b)

Set to Default will revert to what the user has set in the Plugin Configuration section.


### Macro Actions

The macro target lets you change whether a macro is enabled or disabled.

![image](https://github.com/imbateam-gg/titan-reactor/assets/586716/ea1fdce9-faca-4b82-9383-3255d858343b)


### Function Actions

The function condition lets you code against the api and change the game state.

![image](https://github.com/imbateam-gg/titan-reactor/assets/586716/a805e8b6-b866-4426-a796-618cbd4e0ee0)



## Sequence
Defines how actions are executed.

- **All Sync**: All actions run simultaneously.
- **Single Alternate**: Each time the macro is triggered, the next action ( or action group ) is executed.
- **Single Random**: Each time the macro is triggered, a single action or action group is chosen randomly to run.

## Action Group

Actions can be grouped togethor using the arrow keys to treat them as a single action.

![image](https://github.com/imbateam-gg/titan-reactor/assets/586716/d179ab3d-7d30-45a7-8057-e0bfe180fa4d)



## Technical Details

### Condition Comparators
Defines the logic for conditional macros.
- **Equals, NotEquals**: Checks equality/inequality.
- **Greater Than, Less Than, Greater Than O rEquals, Less Than Or Equals**: Compares numerical values.

### Action Operators
These define the operation to be performed.
- **Set To Default**: Resets a setting to its default value.
- **Set**: Explicitly sets a value.
- **Toggle**: Flips a binary setting (e.g., ON/OFF).
- **Increase/Decrease**: Increases or decreases a numerical value ( upto its minimum or maximum ).
- **Increase Cycle/Decrease Cycle**: Increases or decreases a numerical value ( cycling over to its minimum or maximum ).
- **Min/Max**: Sets a value to its minimum or maximum.
- **Execute**: Runs a specific command. For functions.

### TargetType
Specifies the target for the macro action.
- **:app, :plugin, :function, :macro**: The macro can target the app itself, a plugin, a function within the app, or another macro.

### FieldDefinition Macros
These define the attributes of a particular field.
- **type**: Specifies the data type (number, string, etc.).
- **onChange**: Function to execute when the value changes.
- **folder**: Specifies which folder this field belongs to.
- **label**: Display name for the field.
- **value**: The initial value of the field.
- **step, min, max**: Define the range and increment for numerical fields.
- **options**: Predefined choices for the field.
