import { ListMyPrices } from "~/applications/Prices/Ui/ListPrices/ListMyPrices";

const MyPrices = () => (
  <main className="flex flex-col items-center w-full p-4 md:mt-8">
    <div className="flex flex-col gap-y-8 max-w-4xl w-[inherit]">
      <h1>My prices page</h1>
      <ListMyPrices />
    </div>
  </main>
);

export default MyPrices;
