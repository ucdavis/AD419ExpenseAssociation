
export default function AssociationsEmpty(props: Props): JSX.Element {
  const { totals } = props;

  return (
    <div className='text-center'>
      <h2>It looks like there are no unassociated items in here!</h2>
      <p>Perhaps it's time for icecream?</p>
      <i class="fas fa-ice-cream"></i>
    </div>
  );
}
