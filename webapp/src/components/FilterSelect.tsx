import { useContext, type ReactNode } from "react";
import FormSelect from "react-bootstrap/FormSelect";

import styles from "./TeamFilterSelect.module.scss";
import { useFilterStore, type FilterStoreParameters, type IndividualFilterMode, type TeamFilterMode } from "../context/useFilterStore";
import FilterResultsContext from "../context/FilterResultsContext";


export type FilterSelectProps = {
  label: string,

  text?: {
    off?: string | ReactNode,
    [key: string]: string | ReactNode,
  },
}

export type IndividualFilterSelectProps = FilterSelectProps & {
  // Thanks StackOverflow!
  // https://stackoverflow.com/questions/54520676/in-typescript-how-to-get-the-keys-of-an-object-type-whose-values-are-of-a-given
  filterName: { [K in keyof FilterStoreParameters]-?: FilterStoreParameters[K] extends IndividualFilterMode ? K : never }[keyof FilterStoreParameters],

  text?: {
    include?: string | ReactNode,
    exclude?: string | ReactNode,
  },
}

export const IndividualFilterSelect = ({ label, filterName, text }: IndividualFilterSelectProps) => {
  const { setFilterResults } = useContext(FilterResultsContext);
  const updateFilters = useFilterStore((state) => state.update);
  const filterVal = useFilterStore((state) => state[filterName]);

  return (
    <div className={styles.container}>
      <div className={styles.label}>{label}</div>
      <div className={styles.select}>
        <FormSelect value={filterVal} onChange={ (val) => updateFilters({ [filterName]: val.target.value }, setFilterResults) }>
          <option value="off">{ text?.off ?? "Off" }</option>
          <option value="include">{ text?.include ?? "Include" }</option>
          <option value="exclude">{ text?.exclude ?? "Exclude" }</option>
        </FormSelect>
      </div>
    </div>
  );
};


export type TeamFilterSelectProps = FilterSelectProps & {
  // Thanks StackOverflow!
  // https://stackoverflow.com/questions/54520676/in-typescript-how-to-get-the-keys-of-an-object-type-whose-values-are-of-a-given
  filterName: { [K in keyof FilterStoreParameters]-?: FilterStoreParameters[K] extends TeamFilterMode ? K : never }[keyof FilterStoreParameters],

  text?: {
    include?: string | ReactNode,
    ["include-1+"]?: string | ReactNode,
    ["include-2"]?: string | ReactNode,
    exclude?: string | ReactNode,
    ["exclude-1+"]?: string | ReactNode,
    ["exclude-2"]?: string | ReactNode,
  },
}

export const TeamFilterSelect = ({ label, filterName, text }: TeamFilterSelectProps) => {
  const { setFilterResults } = useContext(FilterResultsContext);
  const updateFilters = useFilterStore((state) => state.update);
  const filterVal = useFilterStore((state) => state[filterName]);

  return (
    <div className={styles.container}>
      <div className={styles.label}>{label}</div>
      <div className={styles.select}>
        <FormSelect value={filterVal} onChange={ (val) => updateFilters({ [filterName]: val.target.value }, setFilterResults) }>
          <option value="off">Off</option>
          <optgroup label="Included">
            <option value="include">{ text?.include ?? "Include" }</option>
            <option value="include-1+">{text?.["include-1+"] ?? "Include entire team if 1+ match" }</option>
            <option value="include-2">{ text?.["include-2"] ?? "Only include team if both match" }</option>
          </optgroup>
          <optgroup label="Excluded">
            <option value="exclude">{ text?.exclude ?? "Exclude" }</option>
            <option value="exclude-1+">{ text?.["exclude-1+"] ?? "Exclude entire team if 1+ match" }</option>
            <option value="exclude-2">{ text?.["exclude-2"] ?? "Only exclude team if both match" }</option>
          </optgroup>
        </FormSelect>
      </div>
    </div>
  );
};
