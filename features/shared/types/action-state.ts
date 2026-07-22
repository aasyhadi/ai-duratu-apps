export type FieldErrors = Record<
  string,
  string[] | undefined
>;

export type ActionState<TData = undefined> = {
  success: boolean;
  message: string;
  data?: TData;
  fieldErrors?: FieldErrors;
};