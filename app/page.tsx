'use client';

import { useBearStore } from './store/bearStore';

export default function Home() {
  const bear = useBearStore((state) => state.bear);
  const addBear = useBearStore((state) => state.addBear);

  const bearKeys = Object.keys(bear);

  const addToZustand = (formData: FormData) => {
    const name = formData.get('name') as string;
    const weight = formData.get('weight') as string;
    const newBear = { id: name, name: name, weight: +weight };
    addBear({ [newBear.id]: newBear });
  };

  return (
    <div>
      <form action={addToZustand}>
        <label htmlFor='name'>name</label>
        <input id='name' name='name' autoComplete='false' />
        <label htmlFor='weight'>weight</label>
        <input id='weight' name='weight' autoComplete='false' />
        <button type='submit'>Add!</button>
      </form>
      <div>
        {bearKeys.map((key: string, i: number) => {
          return (
            <div key={i}>
              name: {bear[key].name}, weight: {bear[key].weight}
            </div>
          );
        })}
      </div>
    </div>
  );
}
