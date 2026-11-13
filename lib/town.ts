/*
 * The town the project on screen belongs to. ProjectProvider sets it before it renders its children,
 * so the engine, the Atlas lookup and the contact lookup all read one value without each taking a town argument.
 */
let active = "Cumberland";
export const getActiveTown = () => active;
export const setActiveTown = (town: string) => { active = town; };
