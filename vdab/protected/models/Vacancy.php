<?php
Yii::import('application.vendors.*');
// Load up all the html dom-parser
require_once 'html-dom-parser/simple_html_dom.php';

class Vacancy
{
	public $title;      // job description
	public $belongs_to; // index of the skill that was used to search for this vacancy
	public $url;        // url to the detailpage
	public $skill_vector = array();      // number of occurences of each skill in the detail page
	public $interesting_company = false; // true if this is a company that is follwed on linkedin
	public $company;    // company that submitted the vacancy
	public $location;   // location of the work place

	public function Vacancy($title, $belongs_to, $url, $company, $location)
	{
		$this->title = $title;
		$this->belongs_to = $belongs_to;
		$this->url = $url;
		$this->company = $company;
		$this->location = $location;
	}

	public function get_vacature_html()
	{
		$html = file_get_html($this->url);

		if ($html === null)
			return 'Url bestaat niet';

		// find div with vacature details
		$detailpage = $html->find('div[id^=XCOMPANY]', 0);

		// shit happens
		if ($detailpage === null)
			return 'Geen extra informatie beschikbaar';

		// strip javascript
		$detailpage = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', "", $detailpage->innertext);

		return utf8_encode($detailpage);
	}

	public function calculate_feature_vector($unique_skills, $companies)
	{
		// put in different format for the sort function
		$this->belongs_to = array_search($this->belongs_to, $unique_skills);

		// init each skill with a zero
		$this->skill_vector =
			array_pad($this->skill_vector, count($unique_skills), 0);

		// fetch detail page
		$detailpage = file_get_html($this->url)->find('div[id^=XCOMPANY]', 0);

		//$words = split(' ', $detailpage);
		$words = preg_split('/\W/', $detailpage);

		// 1) calculate number of occurences of each skill in the detail page
		// 2) check if this vacancy has a relation to a company the person followed
		foreach ($words as $word)
		{
			$lower = strtolower($word);

			// check if the word matches a skill
			foreach ($unique_skills as $key => $skill)
				if ($lower === $skill)
					$this->skill_vector[$key]++;

			// check if the name of a company appears on the detail page
			if (in_array($lower, $companies))
				$interesting_company = true;
		}
	}

	static function cmp($first, $second)
	{
		// first criteria: followed company or previous work experience there?
		if ($first->interesting_company)
			return 1;

		// second criteria:  number of skill occurences in the text
		$f1 = array_sum($first->skill_vector);
		$f2 = array_sum($second->skill_vector);

		if ($f1 != $f2)
			return ($f1 > $f2) ? 1 : -1;

		// third criteria: the position of the skill in the cube
		$pos1 = $first->belongs_to;
		$pos2 = $second->belongs_to;

		if ($pos1 != $pos2)
			return ($pos1 > $pos2) ? 1 : -1;

		return 0;
	}
}
?>
