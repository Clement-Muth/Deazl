export enum Currency {
  Euro = "EUR",
  USDollar = "USD",
  BritishPound = "GBP",
  SwissFranc = "CHF",
  AustralianDollar = "AUD",
  CanadianDollar = "CAD",
  ChineseYuan = "CNY",
  JapaneseYen = "JPY",
  UAEDirham = "AED"
}

export function getCurrencySymbol(currency: Currency): string {
  switch (currency) {
    case Currency.Euro:
      return "€";
    case Currency.USDollar:
      return "$";
    case Currency.BritishPound:
      return "£";
    case Currency.SwissFranc:
      return "CHF";
    case Currency.AustralianDollar:
    case Currency.CanadianDollar:
      return "$";
    case Currency.ChineseYuan:
      return "¥";
    case Currency.JapaneseYen:
      return "¥";
    case Currency.UAEDirham:
      return "د.إ";
    default:
      return "";
  }
}
