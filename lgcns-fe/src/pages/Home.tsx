const banner =
  "https://i.pinimg.com/1200x/49/9b/65/499b651238e31591d4f0f15bd36042bf.jpg";

function Banner() {
  return (
    <article className="flex flex-col items-center gap-2">
      <img
        className="h-auto w-full max-w-full"
        src={banner}
        alt="cat banner"
        width={1000}
        height={1000}
      />
      <h3 className="text-center text-2xl font-bold text-red-500">
        Cat Banner Title
      </h3>
      <p>Cat Banner Description</p>
      <button
        type="button"
        className="rounded-lg bg-[#171717] px-4 py-2 text-sm font-medium text-white"
      >
        View More
      </button>
    </article>
  );
}

function Home() {
  return (
    <>
      <section>
        <div id="swiper" className="flex flex-col">
          <Banner />
          <Banner />
          <Banner />
        </div>
      </section>
      <section className="flex flex-col gap-4 px-4 py-20">
        <button
          type="button"
          className="rounded-lg bg-[#171717] px-6 py-8 text-2xl font-bold text-white"
          onClick={() => console.log("Click me")}
        >
          Click me
        </button>
      </section>
    </>
  );
}

export default Home;
