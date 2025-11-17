export type Route = string;

export const pcomparatorHomePageRoute = (): Route => {
  return "/";
};

export const productPageRoute = (productId: string): Route => `/product/${productId}`;

export const searchPageRoute = (categoryId: string, search: string): Route =>
  `/category/${categoryId}/${search}`;

export const shoppingListPageRoute = (listId: string): Route => `/shopping-lists/${listId}`;
