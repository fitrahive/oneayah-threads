# One Day One Ayah

> A bot account on Threads to share sacred ayah of the Qur'an every day.<br>
> Don't forget to follow [@oneayah.id](https://www.threads.net/@oneayah.id)!

## Bismillah

## Requirements

- [Bun](https://bun.sh)
- Coffee ☕

## Getting Started

1. Clone this repository anywhere

   ```bash
   git clone --recurse-submodules https://github.com/fitrahive/oneayah-threads.git
   ```

2. Change to the active directory

   ```bash
   cd oneayah-threads
   ```

3. Install the required dependencies

   ```bash
   bun install
   ```

4. Copy the `.env.example` file to `.env`

   ```bash
   cp .env.example .env
   ```

5. Adjust the contents of `.env` as follows!

   ```bash
   SECRET_KEY = y0ur.s3cr3t

   START_WITH_BISMILLAH = true

   THREADS_USERNAME = xxx
   THREADS_PASSWORD = xxx
   ```

6. Run the _http-api_!

   ```bash
   bun run start:http
   ```

7. Want to use the CLI directly? Use this command.

   ```bash
   bun run start:cli
   ```

8. Want to develop the _http-api_? Feel free:

   ```bash
   bun run dev
   ```

## Usage

Honestly, there is no spesific usage. But, alright, if you insist.

### Want to use a cron-job?

Just set it up yourself using the `crontab -e` command and use the available commands (CLI)?

### Want to use the http-api?

Sure... Just visit
[http://localhost:3000/publish?secret=y0ur.s3cr3t](http://localhost:3000/publish?secret=y0ur.s3cr3t)

### Want to deploy on Vercel?

Hold on for a moment, still working on college assignments.

## FAQ

### Why use `bun`?

Because `bun` is very fast!

### Can it be run with Node.js or Deno?

Not at the moment. I don't have enough time for that.

### Why is the threads-api stored in the modules directory?

Because currently, threads-api does not support bun, but bun is very reliable if only asked to run
TypeScript, that's why I made threads-api as a submodule in git, so that it still uses TypeScript
and not the JavaScript build result. By the way, I have opened an issue related to this
[here](https://github.com/junhoyeo/threads-api/issues/206).

### Why can't I access the `quran-kemenag` and `tafsir` submodules?

Simple, that repository is a "trust", we cannot make it public, for one or two reasons, instead, we
have copied the parsed data result in the [`data`](./data/) directory, I don't think anything is
missing there.

### Where is the source data for the tafsir?

- [Tafsir Kemenag RI](https://quran.kemenag.go.id)
- Tafsir al-Muyassar
- Tafsir al-Mukhtashar
- Tafsir Juz 'Amma by Syaikh Prof. Dr. Shalih Fauzan al-Fauzan
- Zubdatut Tafsir
- Tafsir al-Wajiz by Syaikh Prof. Dr. Wahbah az-Zuhaili
- Tafsir Juz 'Amma by Syaikh Muhammad bin Shalih al-Utsaimin
- Tafsir Al-Madinah Al-Munawwarah
- Tafsir as-Sa'di
- Tafsir Hidayatul Insan
- Tafsir ash-Shaghir

### Is the data used authentic?

InshaAllah, it's authentic. If there are any errors, please report them!

### What about the ayah of the Qur'an and their translations?

Like the existing submodule, [`quran-kemenag`](./modules/quran-kemenag/), it's obtained from
[Qur'an Kemenag RI](https://quran.kemenag.go.id). The RESTful API is provided for free (even
without documentation), you can get it from Network - DevTools.

### Is this halal (permissible)?

I'm not a scholar who can issue fatwas, but from some sources I've come across, it's considered
mubah (permissible)! That means, it's okay to use this. It might potentially be rewarding, as we
are sharing ayah from the Kalamullah (Quran). InshaAllah.

## License

This project is licensed under [Apache 2.0](./LICENSE).<br>
InshaAllah, it's free to use until the maintainer passes away.

**What if the maintainer passes away?**<br>
It's still free, don't worry, just don't forget to send prayers..

## Jazakumullahu khairan katsiran
