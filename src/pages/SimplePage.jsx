export default function SimplePage({ title }) {
  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-20">
      <h1 className="font-h2 text-h2 text-primary">{title}</h1>
      <p className="mt-3 font-body-md text-body-md text-on-surface-variant">
        This page is a placeholder.
      </p>
    </main>
  );
}

