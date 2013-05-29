<?php

namespace Site\LessonBundle\Repository;

use Doctrine\ODM\MongoDB\DocumentRepository;

/**
 * VideoRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class VideoRepository extends DocumentRepository
{
	public function findAllOrderByCtime()
	{
		return $this->createQueryBuilder()
            ->sort('ctime', 'desc')
            ->limit(4)
            ->getQuery()
            ->execute();
	}
	public function findByPublic($limit)
	{
		return $this->createQueryBuilder()
		    ->sort('ctime','desc')
		    ->field('public')->equals(true)
		    ->limit($limit)
		    ->getQuery()
		    ->execute();
	}
}